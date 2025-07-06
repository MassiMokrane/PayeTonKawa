const { checkUserExists, checkProductStock, updateProductStock } = require("../utils/api");
const { publishToQueue } = require("../utils/messageBroker");
const { Order, OrderItem } = require("../models");

exports.createOrder = async (req, res) => {
  const { userId, total, items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "La liste des produits est vide ou invalide" });
  }

  try {
    const userExists = await checkUserExists(userId);
    if (!userExists) return res.status(400).json({ error: "Utilisateur inexistant" });

    for (const item of items) {
      const stockOk = await checkProductStock(item.productId, item.quantity);
      if (!stockOk) {
        return res.status(400).json({
          error: `Stock insuffisant pour le produit ${item.productId}`,
        });
      }
    }

    const order = await Order.create({ userId, total, status: "pending" });

    const orderItems = items.map(item => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
    }));

    await OrderItem.bulkCreate(orderItems);

    for (const item of items) {
      await publishToQueue("product-queue", {
        type: "UPDATE_quantity",
        data: {
          productId: item.productId,
          quantity: item.quantity,
        },
      });
    }

    const createdOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: "items" }],
    });

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Erreur création commande:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: "items" }],
    });

    if (!order) return res.status(404).json({ error: "Commande non trouvée" });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: "Commande non trouvée" });

    await order.update(req.body);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: "Commande non trouvée" });

    await order.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
