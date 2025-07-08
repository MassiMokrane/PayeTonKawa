import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import Loading from "../components/common/Loading";
import ProductService from "../services/productService";
import ProductCard from "../components/products/ProductCard";

const Menu = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Appel dynamique à l'API produits
      const produits = await ProductService.getProducts();
      setProducts(produits);
    } catch (error) {
      toast.error("Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "all", name: "Tous", icon: "🍽️" },
    { id: "coffee", name: "Cafés", icon: "☕" },
    { id: "pastry", name: "Pâtisseries", icon: "🥐" },
    { id: "dessert", name: "Desserts", icon: "🍰" },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product) => {
    if (!user?.isAuthenticated) {
      toast.error("Veuillez vous connecter pour ajouter au panier");
      return;
    }

    // Ici vous ajouteriez la logique du panier
    toast.success(`${product.name} ajouté au panier`);
  };

  const PRODUCT_API_URL = process.env.REACT_APP_PRODUCT_API_URL || "http://localhost:5001";
  const DEFAULT_IMAGE = "/vite.svg";
  const getImageUrl = (imagePath) => imagePath ? `${PRODUCT_API_URL}${imagePath}` : DEFAULT_IMAGE;

  if (loading) {
    return <Loading message="Chargement du menu..." />;
  }

  return (
    <div className="menu-page">
      <div className="container">
        {/* Header de la page */}
        <div className="page-header">
          <h1 className="page-title">Notre Menu</h1>
          <p className="page-subtitle">
            Découvrez notre sélection de cafés, pâtisseries et desserts
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Filtres par catégorie */}
        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`category-btn ${
                selectedCategory === category.id ? "active" : ""
              }`}
            >
              <span className="category-icon">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Grille des produits */}
        <div className="products-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 0,
          margin: 0,
          padding: 0,
          marginTop: "2rem"
        }}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div style={{ marginBottom: 24 }} key={product.id}>
                <ProductCard product={product} onAddToCart={addToCart} />
              </div>
            ))
          ) : (
            <div className="no-products">
              <p>Aucun produit trouvé pour cette recherche.</p>
            </div>
          )}
        </div>

        {/* Message pour les utilisateurs non connectés */}
        {!user?.isAuthenticated && (
          <div className="auth-message">
            <div className="auth-message-content">
              <h3>Connectez-vous pour commander</h3>
              <p>
                Créez un compte ou connectez-vous pour ajouter des produits à
                votre panier.
              </p>
              <div className="auth-buttons">
                <a href="/login" className="btn btn-primary">
                  Se connecter
                </a>
                <a href="/register" className="btn btn-outline">
                  S'inscrire
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
