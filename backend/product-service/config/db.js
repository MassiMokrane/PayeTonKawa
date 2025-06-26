// ===== 3. DB.JS AVEC MEILLEURE GESTION D'ERREURS =====
const { Sequelize } = require("sequelize");

// Vérification des variables d'environnement
const requiredEnvVars = [
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "DB_HOST",
  "DB_PORT",
];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error("❌ Variables d'environnement manquantes:", missingVars);
  process.exit(1);
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: parseInt(process.env.DB_PORT),
    logging: console.log, // Activer les logs pour debug
    retry: {
      max: 3,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectDB = async () => {
  try {
    console.log(
      `🔄 Connexion à MySQL: ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    );
    await sequelize.authenticate();
    console.log("✅ MySQL connecté (Product Service)");
  } catch (err) {
    console.error("❌ Erreur connexion MySQL:");
    console.error("Code d'erreur:", err.original?.code);
    console.error("Message:", err.message);
    console.error("Host:", process.env.DB_HOST);
    console.error("Port:", process.env.DB_PORT);
    console.error("User:", process.env.DB_USER);
    console.error("Database:", process.env.DB_NAME);
    throw err;
  }
};

module.exports = {
  sequelize,
  connectDB,
};
