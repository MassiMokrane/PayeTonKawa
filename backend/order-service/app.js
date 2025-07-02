// app.js pour order-service

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const client = require("prom-client");
const { connectRabbitMQ } = require("./utils/messageBroker");


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

const { connectDB } = require("./config/db");
const { initializeOrderModel } = require("./models/order.model");
const orderRoutes = require("./routes/order.routes.js");

const app = express();

// Initialisation base de données
const initDatabase = async () => {
  try {
    console.log("🔄 Initialisation de la base de données...");
    await connectDB();
    await initializeOrderModel();
    console.log("✅ Base de données initialisée");
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation de la DB:", error.message);
    throw error;
  }
};

// Prometheus métriques
client.collectDefaultMetrics();
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.send(await client.register.metrics());
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

// Démarrage serveur avec retry
const PORT = process.env.PORT || 5002;

const startServer = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await initDatabase();
      await connectRabbitMQ(); // 🔥 ajoute cette ligne
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
