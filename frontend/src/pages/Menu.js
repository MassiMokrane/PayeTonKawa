import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import Loading from "../components/common/Loading";
import productService from "../services/productService";
import "./Menu.css"; // ✅ ajout du style séparé

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

  // const getCategories = () => {
  //   const uniqueCategories = [
  //     ...new Set(products.map((p) => p.category).filter(Boolean)),
  //   ];

  //   const categories = [{ id: "all", name: "Tous", icon: "🍽️" }];
  //   const icons = {
  //     coffee: "☕",
  //     boissons: "🥤",
  //     pastry: "🥐",
  //     alimentaire: "🍕",
  //     electronique: "📱",
  //     vêtements: "👕",
  //     maison: "🏠",
  //     sport: "⚽",
  //     livres: "📚",
  //     dessert: "🍰",
  //     pâtisseries: "🧁",
  //   };
  const getCategories = () => {
    // Map pour éviter les doublons
    const categoryMap = new Map();

    // Ajouter la catégorie "Tous"
    categoryMap.set("all", {
      id: "all",
      name: "Tous",
      icon: "🍽️",
    });

    // Parcourir les produits pour extraire les catégories uniques
    products.forEach((product) => {
      const rawCategory = product.category?.trim();
      if (!rawCategory) return;

      const id = rawCategory.toLowerCase(); // ex: "Boissons" → "boissons"
      if (!categoryMap.has(id)) {
        categoryMap.set(id, {
          id,
          name: rawCategory,
          icon: "📦", // Fallback par défaut
        });
      }
    });

    return Array.from(categoryMap.values());
  };

  const categories = getCategories();

  const filteredProducts = products.filter((product) => {
    const matchCategory =
      selectedCategory === "all" ||
      (product.category &&
        product.category.toLowerCase() === selectedCategory.toLowerCase());

    const matchSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchCategory && matchSearch;
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

    toast.success(`${product.name} ajouté au panier`);
  };

  const ProductCard = ({ product }) => {
    const imageUrl = productService.getImageUrl(product.image);

    return (
      <div className="product-card">
        <div className="product-image">
          {imageUrl ? (
            <img
              src={imageUrl}
              crossOrigin="anonymous"
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
              display: !imageUrl ? "flex" : "none",
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
  };

  if (loading) return <Loading message="Chargement du menu..." />;

  return (
    <div className="menu-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Notre Menu</h1>
          <p className="page-subtitle">Découvrez notre sélection de produits</p>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

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
