// app.js pour order-service

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const client = require("prom-client");
const { connectRabbitMQ } = require("./utils/messageBroker");
const { initializeModels } = require("./models");
const { connectDB } = require("./config/db");
const orderRoutes = require("./routes/order.routes.js");
const { connectAndListenRabbitMQ, publishEvent } = require('./rabbitmq');


// Charger .env dès le départ
dotenv.config();

console.log("=== VARIABLES D'ENVIRONNEMENT ===");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "***" : "NON DÉFINI");
console.log("DB_NAME:", process.env.DB_NAME);
console.log("PORT:", process.env.PORT);
console.log("===============================");


const app = express();

// Initialisation base de données
const initDatabase = async () => {
  try {
    console.log("🔄 Initialisation de la base de données...");
    await connectDB();
    await initializeModels();
    console.log("✅ Base de données initialisée");
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation de la DB:", error.message);
    throw error;
  }
};


// Prometheus métriques
client.collectDefaultMetrics();

// === PROMETHEUS CUSTOM METRICS ===
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP',
  labelNames: ['method', 'route', 'code']
});
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]
});

app.use((req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationInSeconds = duration[0] + duration[1] / 1e9;
    const route = req.baseUrl + (req.route && req.route.path ? req.route.path : '');
    httpRequestCounter.inc({
      method: req.method,
      route: route,
      code: res.statusCode
    });
    httpRequestDuration.observe({
      method: req.method,
      route: route,
      code: res.statusCode
    }, durationInSeconds);
  });
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', require('prom-client').register.contentType);
  res.end(await require('prom-client').register.metrics());
});

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes order
app.use("/api/orders", orderRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    service: "order-service",
    timestamp: new Date().toISOString(),
    env: {
      port: process.env.PORT,
      dbHost: process.env.DB_HOST,
      dbPort: process.env.DB_PORT,
      dbName: process.env.DB_NAME,
    },
  });
});

// Middleware gestion erreurs
app.use((err, req, res, next) => {
  console.error("Erreur serveur:", err.stack);
  res.status(500).json({ msg: "Erreur serveur", error: err.message });
});

// === RabbitMQ events ===
connectAndListenRabbitMQ(async (event) => {
  if (event.type === 'product_deleted') {
    const { productId } = event.data;
    const { Order, OrderItem } = require('./models');
    // Supprimer toutes les commandes contenant ce produit
    const ordersToDelete = await Order.findAll({
      include: [{
        model: OrderItem,
        as: 'items',
        where: { productId }
      }]
    });
    for (const order of ordersToDelete) {
      await order.destroy();
      console.log(`🗑️ Commande ${order.id} supprimée car produit ${productId} supprimé`);
    }
  }
  if (event.type === 'user_deleted') {
    const { userId } = event.data;
    const { Order } = require('./models');
    // Supprimer toutes les commandes de l'utilisateur
    const ordersToDelete = await Order.findAll({ where: { userId } });
    for (const order of ordersToDelete) {
      await order.destroy();
      console.log(`🗑️ Commande ${order.id} supprimée car utilisateur ${userId} supprimé`);
    }
    console.log(`✅ Suppression des commandes terminée pour l'utilisateur ${userId}`);
  }
});

// Démarrage serveur avec retry
const PORT = process.env.PORT || 5002;

const startServer = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await initDatabase();
      await connectRabbitMQ();
      // listenForMessages(); // Démarre le listener RabbitMQ - REMOVED
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`✅ Order-service démarré sur http://localhost:${PORT}`);
      });
      return;
    } catch (error) {
      console.error(`❌ Tentative ${i + 1}/${retries} échouée:`, error.message);
      if (i === retries - 1) {
        console.error("❌ Impossible de démarrer le service après", retries, "tentatives");
        process.exit(1);
      }
      console.log("⏳ Nouvelle tentative dans 5 secondes...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};


startServer();
