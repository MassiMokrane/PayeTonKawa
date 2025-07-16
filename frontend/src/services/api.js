import axios from "axios";

// Configuration des URLs des API
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const PRODUCT_API_URL =
  process.env.REACT_APP_PRODUCT_API_URL || "http://localhost:5001";
const ORDER_API_URL =
  process.env.REACT_APP_ORDER_API_URL || "http://localhost:5002";

// Instance axios pour l'authentification
const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Instance axios pour les produits
const productAPI = axios.create({
  baseURL: `${PRODUCT_API_URL}/api/products`
  // headers: { "Content-Type": "application/json" }, // SUPPRIMÉ pour permettre l'upload d'image
});

// Instance axios pour les commandes
const orderAPI = axios.create({
  baseURL: `${ORDER_API_URL}/api/orders`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token JWT automatiquement
const addTokenInterceptor = (apiInstance) => {
  apiInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Intercepteur pour gérer les erreurs d'authentification
  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
};

// Appliquer les intercepteurs
addTokenInterceptor(authAPI);
addTokenInterceptor(productAPI);
addTokenInterceptor(orderAPI);

export { authAPI, productAPI, orderAPI };
