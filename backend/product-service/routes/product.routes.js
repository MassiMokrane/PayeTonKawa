const router = require("express").Router();
const upload = require("../middlewares/upload");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  updateProductStock,
  deleteProduct,
} = require("../controllers/product.controller");

// Routes avec middleware d'upload pour les images
router.post("/", upload.single("image"), createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", upload.single("image"), updateProduct);
router.delete("/:id", deleteProduct);
// router.put("/api/products/:id", updateProductStock);
router.put("/:id/stock", updateProductStock);


module.exports = router;
