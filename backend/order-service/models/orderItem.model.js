const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");


const OrderItem = sequelize.define("OrderItem", {
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
}, {
  tableName: "order_items",
  timestamps: false,
});

// Fonction d'initialisation (appelée dans app.js)
const initializeOrderItemModel = async () => {
  // Associations
  Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
  OrderItem.belongsTo(Order, { foreignKey: "orderId" });

  await OrderItem.sync(); // tu peux utiliser { alter: true } ou { force: true } si tu veux forcer les modifications
};

module.exports = {
  OrderItem,
  initializeOrderItemModel,
};
