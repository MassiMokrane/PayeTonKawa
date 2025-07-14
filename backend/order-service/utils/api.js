const fetch = require("node-fetch");

const checkUserExists = async (userId) => {
  try {
    const res = await fetch(
      `http://auth-service:5000/api/auth/users/${userId}`
    );
    if (!res.ok) return false;
    const user = await res.json();
    return !!user.id;
  } catch (error) {
    console.error("❌ Erreur vérification utilisateur:", error.message);
    return false;
  }
};

const getProductDetails = async (productId) => {
  try {
    const res = await fetch(
      `http://product-service:5001/api/products/${productId}`
    );
    if (!res.ok) {
      console.log("⚠️ Erreur lors de la récupération du produit", productId);
      return null;
    }
    const product = await res.json();
    console.log("📦 Produit reçu :", product);
    return product;
  } catch (error) {
    console.error("❌ Erreur récupération produit:", error.message);
    return null;
  }
};

const updateProductStock = async (productId, quantity) => {
  try {
    const res = await fetch(
      `http://product-service:5001/api/products/${productId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: quantity, // Nouvelle quantité après déduction
        }),
      }
    );

    if (!res.ok) {
      console.error("❌ Erreur mise à jour stock produit", productId);
      return false;
    }

    console.log("✅ Stock mis à jour pour produit", productId);
    return true;
  } catch (error) {
    console.error("❌ Erreur mise à jour stock:", error.message);
    return false;
  }
};

module.exports = {
  checkUserExists,
  updateProductStock,
  getProductDetails,
};
