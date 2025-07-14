const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
    },
    quantity: {
      type: DataTypes.INTEGER,
    },
    description: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    // NOUVEAU CHAMP POUR L'IMAGE
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Chemin vers l'image du produit",
    },
  },
  {
    timestamps: true,
    tableName: "products",
  }
);

const initializeProductModel = async () => {
  try {
    await Product.sync({ alter: true }); // important pour mettre à jour la table sans la supprimer
    console.log("✅ Table 'products' synchronisée");
  } catch (error) {
    console.error("Erreur synchronisation table 'products':", error);
  }
};

module.exports = {
  Product,
  initializeProductModel,
};
