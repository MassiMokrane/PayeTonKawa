// import { productAPI } from "./api";

// class ProductService {
//   // Récupérer tous les produits
//   async getProducts() {
//     try {
//       const response = await productAPI.get("/");
//       return response.data;
//     } catch (error) {
//       throw new Error(
//         error.response?.data?.msg || "Erreur récupération produits"
//       );
//     }
//   }

//   // Récupérer un produit par ID
//   async getProductById(id) {
//     try {
//       const response = await productAPI.get(`/${id}`);
//       return response.data;
//     } catch (error) {
//       throw new Error(
//         error.response?.data?.msg || "Erreur récupération produit"
//       );
//     }
//   }

//   // Créer un nouveau produit (admin)
//   async createProduct(productData) {
//     try {
//       const response = await productAPI.post("/", productData);
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.msg || "Erreur création produit");
//     }
//   }

//   // Mettre à jour un produit (admin)
//   async updateProduct(id, productData) {
//     try {
//       const response = await productAPI.put(`/${id}`, productData);
//       return response.data;
//     } catch (error) {
//       throw new Error(
//         error.response?.data?.msg || "Erreur mise à jour produit"
//       );
//     }
//   }

//   // Supprimer un produit (admin)
//   async deleteProduct(id) {
//     try {
//       const response = await productAPI.delete(`/${id}`);
//       return response.data;
//     } catch (error) {
//       throw new Error(
//         error.response?.data?.msg || "Erreur suppression produit"
//       );
//     }
//   }

//   // Rechercher des produits
//   async searchProducts(searchTerm) {
//     try {
//       const response = await productAPI.get(`/search?q=${searchTerm}`);
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.msg || "Erreur recherche produits");
//     }
//   }

//   // Filtrer par catégorie
//   async getProductsByCategory(category) {
//     try {
//       const response = await productAPI.get(`/category/${category}`);
//       return response.data;
//     } catch (error) {
//       throw new Error(
//         error.response?.data?.msg ||
//           "Erreur récupération produits par catégorie"
//       );
//     }
//   }
// }

// export default new ProductService();
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

class ProductService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/products`;
  }

  // Créer un nouveau produit avec image
  async createProduct(productData) {
    try {
      const formData = new FormData();
      
      // Ajouter les champs texte
      formData.append('name', productData.name);
      formData.append('price', productData.price);
      
      if (productData.category) {
        formData.append('category', productData.category);
      }
      
      if (productData.quantity) {
        formData.append('quantity', productData.quantity);
      }
      
      if (productData.description) {
        formData.append('description', productData.description);
      }
      
      // Ajouter l'image si elle existe
      if (productData.image) {
        formData.append('image', productData.image);
      }

      const response = await fetch(this.baseURL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création du produit');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur createProduct:', error);
      throw error;
    }
  }

  // Récupérer tous les produits
  async getProducts() {
    try {
      const response = await fetch(this.baseURL);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du chargement des produits');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur getProducts:', error);
      throw error;
    }
  }

  // Récupérer un produit par ID
  async getProductById(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Produit non trouvé');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur getProductById:', error);
      throw error;
    }
  }

  // Mettre à jour un produit
  async updateProduct(id, productData) {
    try {
      const formData = new FormData();
      
      // Ajouter les champs texte
      if (productData.name) {
        formData.append('name', productData.name);
      }
      
      if (productData.price) {
        formData.append('price', productData.price);
      }
      
      if (productData.category) {
        formData.append('category', productData.category);
      }
      
      if (productData.quantity !== undefined) {
        formData.append('quantity', productData.quantity);
      }
      
      if (productData.description) {
        formData.append('description', productData.description);
      }
      
      // Ajouter l'image si elle existe
      if (productData.image) {
        formData.append('image', productData.image);
      }

      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour du produit');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur updateProduct:', error);
      throw error;
    }
  }

  // Supprimer un produit
  async deleteProduct(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression du produit');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur deleteProduct:', error);
      throw error;
    }
  }

  // Utilitaire pour construire l'URL complète de l'image
  getImageUrl(imagePath) {
    if (!imagePath) return null;
    
    // Si le chemin commence déjà par http, le retourner tel quel
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Sinon, construire l'URL complète
    return `${API_BASE_URL}${imagePath}`;
  }

  // Filtrer les produits par catégorie
  async getProductsByCategory(category) {
    try {
      const products = await this.getProducts();
      
      if (category === 'all') {
        return products;
      }
      
      return products.filter(product => 
        product.category && product.category.toLowerCase() === category.toLowerCase()
      );
    } catch (error) {
      console.error('Erreur getProductsByCategory:', error);
      throw error;
    }
  }

  // Rechercher des produits
  async searchProducts(searchTerm) {
    try {
      const products = await this.getProducts();
      
      if (!searchTerm || searchTerm.trim() === '') {
        return products;
      }
      
      const term = searchTerm.toLowerCase();
      
      return products.filter(product =>
        product.name.toLowerCase().includes(term) ||
        (product.description && product.description.toLowerCase().includes(term)) ||
        (product.category && product.category.toLowerCase().includes(term))
      );
    } catch (error) {
      console.error('Erreur searchProducts:', error);
      throw error;
    }
  }

  // Vérifier la disponibilité d'un produit
  isProductAvailable(product) {
    return product && product.quantity > 0;
  }

  // Formater le prix
  formatPrice(price) {
    return parseFloat(price).toFixed(2);
  }

  // Valider les données du produit
  validateProduct(productData) {
    const errors = {};

    if (!productData.name || productData.name.trim() === '') {
      errors.name = 'Le nom du produit est requis';
    }

    if (!productData.price || isNaN(productData.price) || parseFloat(productData.price) < 0) {
      errors.price = 'Le prix doit être un nombre positif';
    }

    if (productData.quantity && (isNaN(productData.quantity) || parseInt(productData.quantity) < 0)) {
      errors.quantity = 'La quantité doit être un nombre positif';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Obtenir les statistiques des produits
  async getProductStats() {
    try {
      const products = await this.getProducts();
      
      const totalProducts = products.length;
      const totalValue = products.reduce((sum, product) => sum + parseFloat(product.price || 0), 0);
      const totalStock = products.reduce((sum, product) => sum + parseInt(product.quantity || 0), 0);
      
      // Compter les produits par catégorie
      const categoryCounts = products.reduce((acc, product) => {
        const category = product.category || 'Sans catégorie';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      return {
        totalProducts,
        totalValue: totalValue.toFixed(2),
        totalStock,
        categoryCounts,
        averagePrice: totalProducts > 0 ? (totalValue / totalProducts).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Erreur getProductStats:', error);
      throw error;
    }
  }
}

// Créer une instance unique du service
const productService = new ProductService();

export default productService;