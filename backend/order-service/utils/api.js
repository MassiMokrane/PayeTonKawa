const axios = require('axios');

// Configuration pour communiquer avec le service produit
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:5001';

// Récupérer les détails d'un produit
const getProductDetails = async (productId) => {
  try {
    const response = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du produit ${productId}:`, error.message);
    return null;
  }
};

// Mettre à jour le stock d'un produit
const updateProductStock = async (productId, newQuantity) => {
  try {
    const response = await axios.put(`${PRODUCT_SERVICE_URL}/api/products/${productId}/stock`, {
      quantity: newQuantity
    });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du stock pour le produit ${productId}:`, error.message);
    return null;
  }
};

// Vérifier si un utilisateur existe
const checkUserExists = async (userId) => {
  try {
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:5000';
    const response = await axios.get(`${authServiceUrl}/api/auth/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la vérification de l'utilisateur ${userId}:`, error.message);
    return null;
  }
};

// Publier un message dans une queue RabbitMQ
const publishToQueue = async (queueName, message) => {
  try {
    // Cette fonction sera implémentée si nécessaire pour la communication RabbitMQ
    console.log(`Message publié dans la queue ${queueName}:`, message);
    return true;
  } catch (error) {
    console.error(`Erreur lors de la publication dans la queue ${queueName}:`, error.message);
    return false;
  }
};

module.exports = {
  getProductDetails,
  updateProductStock,
  checkUserExists,
  publishToQueue
}; 