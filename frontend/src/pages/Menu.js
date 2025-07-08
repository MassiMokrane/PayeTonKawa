import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import Loading from "../components/common/Loading";

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
      // Simuler des données de produits (à remplacer par l'API produits)
      const mockProducts = [
        {
          id: 1,
          name: "Espresso",
          description: "Café corsé et authentique",
          price: 2.5,
          category: "coffee",
          image: "☕",
          available: true,
        },
        {
          id: 2,
          name: "Cappuccino",
          description: "Espresso avec mousse de lait onctueuse",
          price: 3.5,
          category: "coffee",
          image: "☕",
          available: true,
        },
        {
          id: 3,
          name: "Latte",
          description: "Café au lait avec art latte",
          price: 4.0,
          category: "coffee",
          image: "☕",
          available: true,
        },
        {
          id: 4,
          name: "Croissant",
          description: "Viennoiserie feuilletée et beurrée",
          price: 2.0,
          category: "pastry",
          image: "🥐",
          available: true,
        },
        {
          id: 5,
          name: "Muffin Myrtille",
          description: "Muffin moelleux aux myrtilles fraîches",
          price: 3.0,
          category: "pastry",
          image: "🧁",
          available: true,
        },
        {
          id: 6,
          name: "Tarte aux Fruits",
          description: "Tarte saisonnière aux fruits frais",
          price: 4.5,
          category: "dessert",
          image: "🍰",
          available: true,
        },
      ];

      setProducts(mockProducts);
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
        <div className="products-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <div className="product-icon">{product.image}</div>
                  {!product.available && (
                    <div className="unavailable-badge">Indisponible</div>
                  )}
                </div>

                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-price">
                    {product.price.toFixed(2)} €
                  </div>
                </div>

                <div className="product-actions">
                  <button
                    onClick={() => addToCart(product)}
                    disabled={!product.available}
                    className={`btn ${
                      product.available ? "btn-primary" : "btn-disabled"
                    }`}
                  >
                    {product.available ? "Ajouter au panier" : "Indisponible"}
                  </button>
                </div>
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
