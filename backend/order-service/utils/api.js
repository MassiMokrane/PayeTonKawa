const checkUserExists = async (userId) => {
  const res = await fetch(`http://auth-service:5000/api/auth/users/${userId}`);
  if (!res.ok) return false;
  const user = await res.json();
  return !!user.id;
};

const checkProductStock = async (productId, quantity) => {
  const res = await fetch(`http://product-service:5001/api/products/${productId}`);
  if (!res.ok) {
    console.log("⚠️ Erreur lors de la récupération du produit");
    return false;
  }

  const product = await res.json();
  console.log("📦 Produit reçu :", product);

  return product.quantity >= quantity;
};

const updateProductStock = async (productId, quantity) => {
  return await fetch(`http://product-service:5001/api/products/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stockChange: -quantity }),
  });
};

// ✅ Il manquait ceci :
module.exports = {
  checkUserExists,
  checkProductStock,
  updateProductStock,
};
