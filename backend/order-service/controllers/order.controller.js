const { Order } = require("../models/order.model");
const { checkUserExists, checkProductStock, updateProductStock } = require("../utils/api");
const { publishToQueue } = require("../utils/messageBroker");

exports.createOrder = async (req, res) => {
  const { userId, total, productId, quantity } = req.body;

  try {
    // Vérifier utilisateur
    const userExists = await checkUserExists(userId);
    if (!userExists) return res.status(400).json({ error: "Utilisateur inexistant" });

    // Vérifier stock
    const stockOk = await checkProductStock(productId, quantity);
    if (!stockOk) return res.status(400).json({ error: "Stock insuffisant" });

    // Créer commande
    const order = await Order.create({ userId, total, status: "pending" });

    // Mettre à jour stock produit
    await publishToQueue("product-queue", {
  type: "UPDATE_quantity",
  data: {
    productId,
    quantity
     }
    });


    res.status(201).json(order);
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
    const order = await Order.findByPk(req.params.id);
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
