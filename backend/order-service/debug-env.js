// ===== 1. SCRIPT DE DIAGNOSTIC (debug-env.js) =====
// Créez ce fichier dans backend/order-service/ pour diagnostiquer
const dotenv = require("dotenv");
dotenv.config();

console.log("=== DIAGNOSTIC VARIABLES D'ENVIRONNEMENT ===");
console.log("PORT:", process.env.PORT);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USER:", process.env.DB_USER);
console.log(
  "DB_PASSWORD:",
  process.env.DB_PASSWORD ? `'${process.env.DB_PASSWORD}'` : "NON DÉFINI"
);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("===========================================");

// Test de connexion MySQL simple
const mysql = require("mysql2/promise");

async function testConnection() {
  try {
    console.log("\n=== TEST CONNEXION MYSQL ===");
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3309,        // ton port DB par défaut pour order-service
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "root",
      database: process.env.DB_NAME || "orderdb",  // base de données par défaut orderdb
    });

    console.log("✅ Connexion MySQL réussie!");
    await connection.end();
  } catch (error) {
    console.error("❌ Erreur connexion MySQL:", error.message);
  }
}

testConnection();
