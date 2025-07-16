// app.js pour order-service

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const client = require("prom-client");
const orderRoutes = require("./routes/order.routes.js");


// Charger .env dès le départ
dotenv.config();


const app = express();

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
    const route = req.baseUrl + (req.route?.path || '');
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

module.exports = app;
