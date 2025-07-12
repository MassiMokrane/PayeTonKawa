// import { orderAPI } from "./api";

// class OrderService {
//   // Créer une nouvelle commande
//   async createOrder(orderData) {
//     try {
//       const response = await orderAPI.post("/", orderData);
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.msg || "Erreur création commande");
//     }
//   }

//   // Récupérer toutes les commandes (admin)
//   async getAllOrders() {
//     try {
//       const response = await orderAPI.get("/");
//       return response.data;
//     } catch (error) {
//       throw new Error(
//         error.response?.data?.msg || "Erreur récupération commandes"
//       );
//     }
//   }

//   // Récupérer les commandes de l'utilisateur connecté
//   async getUserOrders() {
//     try {
//       const response = await orderAPI.get("/user");
//       return response.data;
//     } catch (error) {
//       throw new Error(
//         error.response?.data?.msg || "Erreur récupération commandes utilisateur"
//       );
//     }
//   }

//   // Récupérer une commande par ID
//   async getOrderById(id) {
//     try {
//       const response = await orderAPI.get(`/${id}`);
//       return response.data;
//     } catch (error) {
//       throw new Error(
//         error.response?.data?.msg || "Erreur récupération commande"
//       );
//     }
//   }

//   // Mettre à jour le statut d'une commande (admin)
//   async updateOrderStatus(id, status) {
//     try {
//       const response = await orderAPI.put(`/${id}/status`, { status });
//       return response.data;
//     } catch (error) {
//       throw new Error(
//         error.response?.data?.msg || "Erreur mise à jour statut commande"
//       );
//     }
//   }

//   // Annuler une commande
//   async cancelOrder(id) {
//     try {
//       const response = await orderAPI.delete(`/${id}`);
//       return response.data;
//     } catch (error) {
//       throw new Error(
//         error.response?.data?.msg || "Erreur annulation commande"
//       );
//     }
//   }

//   // Calculer le total du panier
//   calculateCartTotal(cartItems) {
//     return cartItems.reduce((total, item) => {
//       return total + item.price * item.quantity;
//     }, 0);
//   }

//   // Formater le prix
//   formatPrice(price) {
//     return new Intl.NumberFormat("fr-FR", {
//       style: "currency",
//       currency: "EUR",
//     }).format(price);
//   }
// }

// export default new OrderService();
import { orderAPI } from "./api";

class OrderService {
  // Créer une nouvelle commande
  async createOrder(orderData) {
    try {
      console.log("OrderService - Données envoyées:", orderData);
      const response = await orderAPI.post("/", orderData);
      return response.data;
    } catch (error) {
      console.error(
        "OrderService - Erreur:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.error || "Erreur création commande"
      );
    }
  }
  async getUserOrders(userId) {
    // ⬅️ nécessite id
    if (!userId) throw new Error("ID utilisateur manquant");
    const response = await orderAPI.get(`/user/${userId}`);
    return response.data;
  }

  // Récupérer toutes les commandes (admin)
  async getAllOrders() {
    try {
      const response = await orderAPI.get("/");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Erreur récupération commandes"
      );
    }
  }

  async getUserOrders(userId) {
    if (!userId) throw new Error("ID utilisateur manquant");

    const response = await orderAPI.get(`/user/${userId}`);
    return response.data;
  }

  // Récupérer une commande par ID
  async getOrderById(id) {
    try {
      const response = await orderAPI.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Erreur récupération commande"
      );
    }
  }

  // Mettre à jour le statut d'une commande (admin)
  async updateOrderStatus(id, status) {
    try {
      const response = await orderAPI.put(`/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Erreur mise à jour statut commande"
      );
    }
  }

  // Annuler une commande
  async cancelOrder(id) {
    try {
      const response = await orderAPI.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Erreur annulation commande"
      );
    }
  }

  // Calculer le total du panier
  calculateCartTotal(cartItems) {
    return cartItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  }

  // Formater le prix
  formatPrice(price) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  }
}

export default new OrderService();
