const router = require("express").Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrdersByUserId,
} = require("../controllers/order.controller");

// Créer une commande
router.post("/", createOrder);

// Récupérer toutes les commandes
router.get("/", getOrders);

// Récupérer une commande par ID
router.get("/:id", getOrderById);

// Récupérer les commandes d'un utilisateur
router.get("/user/:userId", getOrdersByUserId);

// Mettre à jour une commande
router.put("/:id", updateOrder);

// Supprimer une commande
router.delete("/:id", deleteOrder);

module.exports = router;
