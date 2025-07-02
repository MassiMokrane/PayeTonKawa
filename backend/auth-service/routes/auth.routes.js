// const router = require("express").Router();
// const { register, login } = require("../controllers/auth.controller");

// router.post("/register", register);
// router.post("/login", login);

// module.exports = router;
const router = require("express").Router();
const {
  register,
  login,
  getUsers,
  updateUser,
   getUserById,
} = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);
router.get("/users", getUsers);
router.put("/users/:id", updateUser);
router.get("/users/:id", getUserById); // 👈 ajoute cette ligne
module.exports = router;
