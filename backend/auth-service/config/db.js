// const mongoose = require("mongoose");
// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("✅ MongoDB connecté");
//   } catch (err) {
//     console.error("❌ Erreur connexion MongoDB:", err);
//     process.exit(1);
//   }
// };
// module.exports = connectDB;
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false, // Désactivez les logs SQL en production
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connecté");
  } catch (err) {
    console.error("❌ Erreur connexion MySQL:", err);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB,
};
