const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nom: {
      // ajout du champ nom
      type: DataTypes.STRING,
      allowNull: false,
    },
    prenom: {
      // ajout du champ prenom
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("client", "admin"),
      defaultValue: "client",
    },
  },
  {
    timestamps: true,
    tableName: "users",
  }
);

// Synchroniser le modèle avec la base de données
// (À exécuter uniquement au démarrage du serveur)
const initializeUserModel = async () => {
  try {
    await User.sync();
    console.log("✅ Table 'users' synchronisée");
  } catch (error) {
    console.error(
      " Erreur lors de la synchronisation de la table 'users':",
      error
    );
  }
};

module.exports = {
  User,
  initializeUserModel,
};
