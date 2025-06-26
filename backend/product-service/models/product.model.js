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
  },
  {
    timestamps: true,
    tableName: "products",
  }
);

const initializeProductModel = async () => {
  try {
    await Product.sync();
    console.log("✅ Table 'products' synchronisée");
  } catch (error) {
    console.error("Erreur synchronisation table 'products':", error);
  }
};

module.exports = {
  Product,
  initializeProductModel,
};