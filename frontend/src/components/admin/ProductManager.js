import React, { useState, useEffect } from "react";
import { productAPI } from "../../services/api";

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    quantity: "",
    image: null,
  });

  // Récupérer tous les produits
  const fetchProducts = async () => {
    try {
      const response = await productAPI.get("/");
      setProducts(response.data);
    } catch (error) {
      console.error("Erreur récupération produits:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Gérer les changements du formulaire
  const handleInputChange = (e) => {
    if (e.target.type === "file") {
      setFormData({
        ...formData,
        image: e.target.files[0],
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  // Créer un nouveau produit
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("quantity", formData.quantity);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      await productAPI.post("/", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Produit créé avec succès");
      resetForm();
      fetchProducts();
    } catch (error) {
      alert("Erreur lors de la création: " + error.response?.data?.error);
    }
  };

  // Modifier un produit
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("quantity", formData.quantity);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      await productAPI.put(`/${editingProduct.id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Produit modifié avec succès");
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      alert("Erreur lors de la modification: " + error.response?.data?.error);
    }
  };

  // Supprimer un produit
  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        await productAPI.delete(`/${productId}`);
        alert("Produit supprimé avec succès");
        fetchProducts();
      } catch (error) {
        alert("Erreur lors de la suppression: " + error.response?.data?.error);
      }
    }
  };

  // Préparer l'édition
  const startEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      image: null,
    });
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      price: "",
      quantity: "",
      image: null,
    });
  };

  // Annuler l'édition
  const cancelEdit = () => {
    setEditingProduct(null);
    resetForm();
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="product-manager">
      <h2>📦 Gestion des Produits</h2>

      {/* Formulaire d'ajout/modification */}
      <div className="form-section">
        <h3>{editingProduct ? "Modifier le produit" : "Ajouter un produit"}</h3>
        <form
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
        >
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Nom du produit"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="category"
              placeholder="Catégorie"
              value={formData.category}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              name="price"
              placeholder="Prix"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              name="quantity"
              placeholder="Quantité"
              value={formData.quantity}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          <div className="form-group">
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleInputChange}
            />
          </div>
          <div className="form-buttons">
            <button type="submit">
              {editingProduct ? "Modifier" : "Ajouter"}
            </button>
            {editingProduct && (
              <button type="button" onClick={cancelEdit}>
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Liste des produits */}
      <div className="products-list">
        <h3>Liste des produits ({products.length})</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Nom</th>
              <th>Catégorie</th>
              <th>Prix</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>
                  {product.image && (
                    <img
                      src={`${process.env.REACT_APP_PRODUCT_API_URL}${product.image}`}
                      alt={product.name}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.price}€</td>
                <td>{product.quantity}</td>
                <td>
                  <button onClick={() => startEdit(product)}>
                    ✏️ Modifier
                  </button>
                  <button onClick={() => handleDeleteProduct(product.id)}>
                    🗑️ Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManager;
