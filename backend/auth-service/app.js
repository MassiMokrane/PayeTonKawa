// const express = require("express");
// const cors = require("cors");
// const helmet = require("helmet");
// const dotenv = require("dotenv");
// const connectDB = require("./config/db");
// const authRoutes = require("./routes/auth.routes");
// const client = require("prom-client");

// dotenv.config();
// const app = express();
// connectDB();

// // Prometheus metrics
// client.collectDefaultMetrics();
// app.get("/metrics", async (req, res) => {
//   res.set("Content-Type", client.register.contentType);
//   res.send(await client.register.metrics());
// });

// app.use(helmet());
// app.use(cors());
// app.use(express.json());

// app.use("/api/auth", authRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () =>
//   console.log(`✅ auth-service sur http://localhost:${PORT}`)
// );*

/*SQL*/
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");
const { initializeUserModel } = require("./models/user.model");
const authRoutes = require("./routes/auth.routes");
const client = require("prom-client");

dotenv.config();
const app = express();

// Connexion à la base de données
connectDB();
// Initialisation du modèle User (synchronisation avec la base de données)
initializeUserModel();

// Prometheus metrics
client.collectDefaultMetrics();
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.send(await client.register.metrics());
});

// Middleware de sécurité
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Route de vérification de santé
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
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
