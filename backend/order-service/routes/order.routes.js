console.log("=== order.routes.js chargé ===");
const router = require("express").Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrdersByUserId,
} = require("../controllers/order.controller");
const { isAuthenticated, isAdmin } = require("../middlewares/auth.middleware");

// Middleware pour autoriser l'accès à ses propres commandes ou à l'admin
const canReadOwnOrders = (req, res, next) => {
  if (req.user?.role === 'admin' || req.user?.id == req.params.userId) {
    return next();
  }
  return res.status(403).json({ msg: "Accès interdit à ces commandes" });
};

// Créer une commande (authentifié : client ou admin)
router.post("/", isAuthenticated, createOrder);

// Récupérer toutes les commandes (admin uniquement)
router.get("/", isAuthenticated, isAdmin, getOrders);

// Récupérer une commande par ID (admin uniquement)
router.get("/:id", isAuthenticated, isAdmin, getOrderById);

// Récupérer les commandes d'un utilisateur (admin ou utilisateur concerné)
router.get("/user/:userId", isAuthenticated, canReadOwnOrders, getOrdersByUserId);

// Mettre à jour une commande (admin uniquement)
router.put("/:id", isAuthenticated, isAdmin, updateOrder);

// Supprimer une commande (admin uniquement)
router.delete("/:id", isAuthenticated, isAdmin, deleteOrder);

module.exports = router;
