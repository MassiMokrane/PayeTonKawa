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
      defaultValue: 0,
      comment: "Montant total calculé automatiquement depuis les OrderItems",
    },
  },
  {
    timestamps: true,
    tableName: "orders",
  }
);

// Méthode pour calculer le total automatiquement
Order.prototype.calculateTotal = async function () {
  const OrderItem = require("./orderItem.model").OrderItem;

  const items = await OrderItem.findAll({
    where: { orderId: this.id },
  });

  const total = items.reduce(
    (sum, item) => sum + parseFloat(item.totalPrice),
    0
  );

  // Mettre à jour uniquement si le total a changé
  if (Math.abs(this.total - total) > 0.01) {
    // Comparaison avec tolérance pour les flottants
    await this.update({ total }, { hooks: false }); // Éviter la boucle infinie
  }

  return total;
};

module.exports = { Order };
