const router = require("express").Router();
const {
  register,
  login,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getMyProfile,
  updateMyProfile,
} = require("../controllers/auth.controller");
const { isAuthenticated, isAdmin } = require("../middlewares/auth.middleware");

router.post("/register", register);
router.post("/login", login);

// Routes pour l'utilisateur connecté (pas besoin d'être admin)
router.get("/profile", isAuthenticated, getMyProfile);
router.put("/profile", isAuthenticated, updateMyProfile);

// Routes admin (gestion de tous les utilisateurs)
router.get("/users", isAuthenticated, isAdmin, getUsers);
router.get("/users/:id", isAuthenticated, isAdmin, getUserById);
router.put("/users/:id", isAuthenticated, isAdmin, updateUser);
router.delete("/users/:id", isAuthenticated, isAdmin, deleteUser);

module.exports = router;
