import { authAPI } from "./api";

class AuthService {
  // Connexion
  async login(email, password) {
    try {
      const response = await authAPI.post("/login", { email, password });
      const { token, role, id } = response.data; // 👈 récupère aussi id

      // Stocker dans le localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userId", id); // 👈 obligatoire pour getUserOrders

      return { token, role, id };
    } catch (error) {
      throw new Error(error.response?.data?.msg || "Erreur de connexion");
    }
  }

  // Inscription
  async register(userData) {
    try {
      const response = await authAPI.post("/register", userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg || "Erreur d'inscription");
    }
  }

  // Déconnexion
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId"); // 👈 nettoyage du userId aussi
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    return !!localStorage.getItem("token");
  }

  // Obtenir le rôle de l'utilisateur
  getUserRole() {
    return localStorage.getItem("userRole");
  }

  // Obtenir le token
  getToken() {
    return localStorage.getItem("token");
  }

  // Facultatif : méthode pour obtenir l’ID utilisateur
  getUserId() {
    return localStorage.getItem("userId");
  }

  // Admin : récupérer tous les utilisateurs
  async getUsers() {
    try {
      const response = await authAPI.get("/users");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.msg || "Erreur récupération utilisateurs"
      );
    }
  }

  // Admin : récupérer un utilisateur par ID
  async getUserById(id) {
    try {
      const response = await authAPI.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.msg || "Erreur récupération utilisateur"
      );
    }
  }

  // Admin : mettre à jour un utilisateur
  async updateUser(id, userData) {
    try {
      const response = await authAPI.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.msg || "Erreur mise à jour utilisateur"
      );
    }
  }

  // Admin : supprimer un utilisateur
  async deleteUser(id) {
    try {
      const response = await authAPI.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.msg || "Erreur suppression utilisateur"
      );
    }
  }
}

export default new AuthService();
