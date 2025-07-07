import { productAPI } from "./api";

class ProductService {
  // Récupérer tous les produits
  async getProducts() {
    try {
      const response = await productAPI.get("/");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.msg || "Erreur récupération produits"
      );
    }
  }

  // Récupérer un produit par ID
  async getProductById(id) {
    try {
      const response = await productAPI.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.msg || "Erreur récupération produit"
      );
    }
  }

  // Créer un nouveau produit (admin)
  async createProduct(productData) {
    try {
      const response = await productAPI.post("/", productData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg || "Erreur création produit");
    }
  }

  // Mettre à jour un produit (admin)
  async updateProduct(id, productData) {
    try {
      const response = await productAPI.put(`/${id}`, productData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.msg || "Erreur mise à jour produit"
      );
    }
  }

  // Supprimer un produit (admin)
  async deleteProduct(id) {
    try {
      const response = await productAPI.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.msg || "Erreur suppression produit"
      );
    }
  }

  // Rechercher des produits
  async searchProducts(searchTerm) {
    try {
      const response = await productAPI.get(`/search?q=${searchTerm}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg || "Erreur recherche produits");
    }
  }

  // Filtrer par catégorie
  async getProductsByCategory(category) {
    try {
      const response = await productAPI.get(`/category/${category}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.msg ||
          "Erreur récupération produits par catégorie"
      );
    }
  }
}

export default new ProductService();
