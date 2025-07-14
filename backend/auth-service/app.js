/*SQL*/
const dotenv = require("dotenv");
dotenv.config();

// ton code ici...

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { connectDB } = require("./config/db");
const { initializeUserModel } = require("./models/user.model");
const authRoutes = require("./routes/auth.routes");
const client = require("prom-client");
const { connectAndListenRabbitMQ, publishEvent } = require('./rabbitmq');

dotenv.config();
const app = express();

// Connexion à la base de données
connectDB();
// Initialisation du modèle User (synchronisation avec la base de données)
initializeUserModel();

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

// === RabbitMQ events ===
connectAndListenRabbitMQ();

// Middleware de sécurité
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Route de vérification de santé
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "UP",
    service: "auth-service",
    timestamp: new Date().toISOString(),
    env: {
      port: process.env.PORT,
      dbHost: process.env.DB_HOST,
      dbPort: process.env.DB_PORT,
      dbName: process.env.DB_NAME,
    }
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: "Erreur serveur" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ auth-service sur http://localhost:${PORT}`)
);
