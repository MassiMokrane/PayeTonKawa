// // const mongoose = require("mongoose");
// // const connectDB = async () => {
// //   try {
// //     await mongoose.connect(process.env.MONGO_URI);
// //     console.log("✅ MongoDB connecté");
// //   } catch (err) {
// //     console.error("❌ Erreur connexion MongoDB:", err);
// //     process.exit(1);
// //   }
// // };
// // module.exports = connectDB;
// const { Sequelize } = require("sequelize");
// console.log("DB_USER:", process.env.DB_USER);
// console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
// console.log("DB_HOST:", process.env.DB_HOST);
// console.log("DB_NAME:", process.env.DB_NAME);

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST,
//     dialect: "mysql",
//     logging: false, // Désactivez les logs SQL en production
//   }
// );

// const connectDB = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("✅ MySQL connecté");
//   } catch (err) {
//     console.error("❌ Erreur connexion MySQL:", err);
//     process.exit(1);
//   }
// };

// module.exports = {
//   sequelize,
//   connectDB,
// };
const { Sequelize } = require("sequelize");

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_NAME:", process.env.DB_NAME);

const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;

const sequelizeWithoutDb = new Sequelize("", dbUser, dbPassword, {
  host: dbHost,
  dialect: "mysql",
  logging: false,
});

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: "mysql",
  logging: false,
});

const connectDB = async () => {
  try {
    // 1) Connexion sans DB pour créer la base si besoin
    await sequelizeWithoutDb.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`
    );
    console.log(`✅ Base de données '${dbName}' créée ou déjà existante`);

    // 2) Connexion sur la base
    await sequelize.authenticate();
    console.log("✅ MySQL connecté à la base", dbName);
  } catch (err) {
    console.error("❌ Erreur connexion MySQL:", err);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB,
};
