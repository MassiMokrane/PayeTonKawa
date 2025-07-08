import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import Loading from "../components/common/Loading";
import productService from "../services/productService";

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
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des produits");
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  // Obtenir les catégories uniques depuis les produits
  const getCategories = () => {
    const uniqueCategories = [
      ...new Set(products.map((p) => p.category).filter(Boolean)),
    ];

    const categories = [{ id: "all", name: "Tous", icon: "🍽️" }];

    // Ajouter les catégories dynamiquement avec des icônes par défaut
    uniqueCategories.forEach((category) => {
      const categoryIcons = {
        coffee: "☕",
        boissons: "🥤",
        pastry: "🥐",
        alimentaire: "🍕",
        electronique: "📱",
        vêtements: "👕",
        maison: "🏠",
        sport: "⚽",
        livres: "📚",
        dessert: "🍰",
        pâtisseries: "🧁",
      };

      categories.push({
        id: category.toLowerCase(),
        name: category,
        icon: categoryIcons[category.toLowerCase()] || "📦",
      });
    });

    return categories;
  };

  const categories = getCategories();

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" ||
      (product.category &&
        product.category.toLowerCase() === selectedCategory.toLowerCase());

    const matchesSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const addToCart = (product) => {
    if (!user?.isAuthenticated) {
      toast.error("Veuillez vous connecter pour ajouter au panier");
      return;
    }

    if (!productService.isProductAvailable(product)) {
      toast.error("Ce produit n'est pas disponible en stock");
      return;
    }

    // Ici vous ajouteriez la logique du panier
    toast.success(`${product.name} ajouté au panier`);
  };

  const ProductCard = ({ product }) => (
    <div className="product-card">
      <div className="product-image">
        {product.image ? (
          <img
            src={productService.getImageUrl(product.image)}
            alt={product.name}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="product-icon-fallback"
          style={{
            display: product.image ? "none" : "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            fontSize: "3rem",
            color: "#999",
          }}
        >
          📦
        </div>
        {!productService.isProductAvailable(product) && (
          <div className="unavailable-badge">Rupture de stock</div>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>

        {product.category && (
          <span className="product-category">{product.category}</span>
        )}

        <p className="product-description">
          {product.description || "Aucune description disponible"}
        </p>

        <div className="product-price">
          {productService.formatPrice(product.price)} €
        </div>

        {product.quantity !== undefined && (
          <div className="product-stock">
            Stock: {product.quantity}{" "}
            {product.quantity > 1 ? "unités" : "unité"}
          </div>
        )}
      </div>

      <div className="product-actions">
        <button
          onClick={() => addToCart(product)}
          disabled={!productService.isProductAvailable(product)}
          className={`btn ${
            productService.isProductAvailable(product)
              ? "btn-primary"
              : "btn-disabled"
          }`}
        >
          {productService.isProductAvailable(product)
            ? "Ajouter au panier"
            : "Rupture de stock"}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return <Loading message="Chargement du menu..." />;
  }

  return (
    <div className="menu-page">
      <div className="container">
        {/* Header de la page */}
        <div className="page-header">
          <h1 className="page-title">Notre Menu</h1>
          <p className="page-subtitle">Découvrez notre sélection de produits</p>
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
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="no-products">
              <p>Aucun produit trouvé pour cette recherche.</p>
              {products.length === 0 && (
                <button
                  onClick={fetchProducts}
                  className="btn btn-primary"
                  style={{ marginTop: "10px" }}
                >
                  Recharger les produits
                </button>
              )}
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

      <style jsx>{`
        .product-card {
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: transform 0.3s ease;
        }

        .product-card:hover {
          transform: translateY(-5px);
        }

        .product-image {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-category {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          margin-bottom: 8px;
        }

        .product-stock {
          font-size: 0.9rem;
          color: #666;
          margin-top: 8px;
        }

        .unavailable-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #f44336;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .no-products {
          grid-column: 1 / -1;
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .btn-disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .btn-disabled:hover {
          background: #ccc;
        }

        .search-input {
          width: 100%;
          max-width: 400px;
          padding: 12px;
          border: 2px solid #e1e5e9;
          border-radius: 25px;
          font-size: 16px;
          margin: 20px auto;
          display: block;
        }

        .category-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin-bottom: 20px;
        }

        .category-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border: 2px solid #e1e5e9;
          background: white;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .category-btn:hover {
          border-color: #667eea;
        }

        .category-btn.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }
      `}</style>
    </div>
  );
};

export default Menu;
