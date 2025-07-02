const router = require("express").Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  updateProductStock,
  deleteProduct,
} = require("../controllers/product.controller");

router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
// router.put("/api/products/:id", updateProductStock);
router.put("/:id/stock", updateProductStock);


module.exports = router;