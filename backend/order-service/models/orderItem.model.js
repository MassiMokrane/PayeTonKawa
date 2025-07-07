const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment:
        "Prix unitaire du produit au moment de la commande (traçabilité)",
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: "Prix total de cette ligne (unitPrice * quantity)",
    },
  },
  {
    tableName: "order_items",
    timestamps: true,
    hooks: {
      beforeCreate: (orderItem, options) => {
        // Calculer le prix total automatiquement
        orderItem.totalPrice = orderItem.unitPrice * orderItem.quantity;
      },
      beforeUpdate: (orderItem, options) => {
        // Recalculer le prix total si unitPrice ou quantity change
        if (orderItem.changed("unitPrice") || orderItem.changed("quantity")) {
          orderItem.totalPrice = orderItem.unitPrice * orderItem.quantity;
        }
      },
    },
  }
);

module.exports = {
  OrderItem,
};
