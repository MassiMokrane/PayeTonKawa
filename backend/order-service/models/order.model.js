const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "paid", "shipped", "cancelled"),
      defaultValue: "pending",
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    // Optionnel : adresse de livraison, date de livraison, etc.
  },
  {
    timestamps: true,
    tableName: "orders",
  }
);

const initializeOrderModel = async () => {
  try {
    await Order.sync();
    console.log("✅ Table 'orders' synchronisée");
  } catch (error) {
    console.error("Erreur synchronisation table 'orders':", error);
  }
};

module.exports = {
  Order,
  initializeOrderModel,
};
