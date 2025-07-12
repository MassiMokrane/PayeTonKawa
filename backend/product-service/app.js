const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const path = require("path");

// CHARGER .env EN PREMIER
dotenv.config();

// DEBUG: Afficher les variables d'environnement
console.log("=== VARIABLES D'ENVIRONNEMENT ===");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "***" : "NON DÉFINI");
console.log("DB_NAME:", process.env.DB_NAME);
console.log("===============================");

const { connectDB } = require("./config/db");
const { initializeProductModel } = require("./models/product.model");
const productRoutes = require("./routes/product.routes");
const client = require("prom-client");

const app = express();

// Fonction d'initialisation avec gestion d'erreurs
const initDatabase = async () => {
  try {
    console.log("🔄 Initialisation de la base de données...");
    await connectDB();
    await initializeProductModel();
    console.log("✅ Base de données initialisée");
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'initialisation de la DB:",
      error.message
    );
    throw error;
  }
};

// Métriques Prometheus
client.collectDefaultMetrics();
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.send(await client.register.metrics());
});

// Middlewares
// app.use(helmet());
<<<<<<< HEAD
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'", "'unsafe-inline'"], // 👉 autorise les scripts inline
//         styleSrc: ["'self'", "'unsafe-inline'", "https:"],
//         imgSrc: [
//           "'self'",
//           "data:",
//           "blob:",
//           "http://localhost:5001",
//           "http://localhost:3000",
//           "http://localhost:3001"
//         ],
//         connectSrc: [
//           "'self'",
//           "http://localhost:5001",
//           "http://localhost:3000",
//           "http://localhost:3001"
//         ],
//         fontSrc: ["'self'", "https:", "data:"],
//         objectSrc: ["'none'"],
//         upgradeInsecureRequests: [],
//       },
//     },
//   })
// );
=======
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "http://localhost:5001", // ← ton backend
          "http://localhost:3000",
          "http://localhost:3001",
          // ← ton frontend React
        ],
        connectSrc: [
          "'self'",
          "http://localhost:5001",
          "http://localhost:3000",
          "http://localhost:3001",
          // ← ton frontend React
        ],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);
>>>>>>> 8b5be79c3db92d99fa800ecc4b5a753f7f63a343

app.use(cors());
app.use(express.json());
// Sert les fichiers HTML/CSS/JS de ton frontend
app.use(express.static(path.join(__dirname, "public")));

// Ajout du header Cross-Origin-Resource-Policy pour les images
app.use("/uploads", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
}, express.static(path.join(__dirname, "uploads")));
// app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/products", productRoutes);

// Health check détaillé
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    service: "product-service",
    timestamp: new Date().toISOString(),
    env: {
      port: process.env.PORT,
      dbHost: process.env.DB_HOST,
      dbPort: process.env.DB_PORT,
      dbName: process.env.DB_NAME,
    },
  });
});
// Toutes les routes autres que l'API → index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Middleware de gestion d'erreurs globales
app.use((err, req, res, next) => {
  console.error("Erreur serveur:", err.stack);

  // Gestion spécifique des erreurs Multer
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "Fichier trop volumineux (max 5MB)" });
    }
    return res.status(400).json({ error: "Erreur d'upload: " + err.message });
  }

  // Gestion des erreurs de validation de fichier
  if (err.message.includes("Seules les images sont autorisées")) {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({ msg: "Erreur serveur", error: err.message });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5001;

// Démarrage avec retry logic
const startServer = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await initDatabase();
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`✅ Product-service démarré sur http://localhost:${PORT}`);
        console.log(
          `📁 Images accessibles sur http://localhost:${PORT}/uploads/`
        );
      });
      return;
    } catch (error) {
      console.error(`❌ Tentative ${i + 1}/${retries} échouée:`, error.message);
      if (i === retries - 1) {
        console.error(
          "❌ Impossible de démarrer le service après",
          retries,
          "tentatives"
        );
        process.exit(1);
      }
      console.log("⏳ Nouvelle tentative dans 5 secondes...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

startServer();
