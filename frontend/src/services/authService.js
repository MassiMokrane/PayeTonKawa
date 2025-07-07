import { authAPI } from "./api";

class AuthService {
  // Connexion
  async login(email, password) {
    try {
      const response = await authAPI.post("/login", { email, password });
      const { token, role } = response.data;

      // Stocker le token et le rôle dans le localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", role);

      return { token, role };
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
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    return !!localStorage.getItem("token");
  }

  // Obtenir le rôle de l'utilisateur
  getUserRole() {
    return localStorage.getItem("userRole");
  }

  // Vérifier si l'utilisateur est admin
  isAdmin() {
    return this.getUserRole() === "admin";
  }

  // Obtenir le token
  getToken() {
    return localStorage.getItem("token");
  }

  // Récupérer tous les utilisateurs (admin seulement)
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

  // Récupérer un utilisateur par ID
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

  // Mettre à jour un utilisateur
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

  // Supprimer un utilisateur
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
