const { sequelize } = require("../config/db");
const { DataTypes } = require("sequelize");

const Order = sequelize.define("Order", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  status: {
    type: DataTypes.ENUM("pending", "paid", "shipped", "cancelled"),
    defaultValue: "pending",
  },
  total: { type: DataTypes.FLOAT, allowNull: false },
}, {
  timestamps: true,
  tableName: "orders",
});

const OrderItem = sequelize.define("OrderItem", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
}, {
  timestamps: true,
  tableName: "order_items",
});

// Associations
Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

const initializeModels = async () => {
  await sequelize.sync();
  console.log("✅ Tables synchronisées");
};

module.exports = {
  Order,
  OrderItem,
  initializeModels,
};
