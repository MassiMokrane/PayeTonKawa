import React from "react";

const PRODUCT_API_URL = process.env.REACT_APP_PRODUCT_API_URL || "http://localhost:5001";
const DEFAULT_IMAGE = "/vite.svg";
const getImageUrl = (imagePath) => imagePath ? `${PRODUCT_API_URL}${imagePath}` : DEFAULT_IMAGE;

const ProductCard = ({ product, onAddToCart }) => {
  const isAvailable = product.quantity > 0;
  return (
    <div className="product-card" style={{
      background: "#fff",
      borderRadius: "4px",
      boxShadow: "none",
      padding: "0.4rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minHeight: 120,
      maxWidth: 300,
      width: "100%",
      position: "relative",
    }}>
      <div className="product-image" style={{
        width: 50,
        height: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 0,
        background: "#f7f7f7",
        borderRadius: 4,
        overflow: "hidden"
      }}>
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="product-img"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }}
        />
        {!isAvailable && (
          <div className="unavailable-badge" style={{
            position: "absolute",
            top: 6,
            right: 6,
            background: "#e74c3c",
            color: "#fff",
            padding: "2px 6px",
            borderRadius: 6,
            fontSize: 11
          }}>Indisponible</div>
        )}
      </div>
      <div className="product-info" style={{ textAlign: "center" }}>
        <h3 className="product-name" style={{ fontSize: 15, margin: 0 }}>{product.name}</h3>
        <p className="product-description" style={{ fontSize: 12, color: "#666", margin: 0 }}>{product.description}</p>
        <div className="product-price" style={{ fontWeight: 600, marginTop: 8, fontSize: 14 }}>
          {typeof product.price === "number"
            ? product.price.toFixed(2) + " €"
            : !isNaN(parseFloat(product.price))
              ? parseFloat(product.price).toFixed(2) + " €"
              : product.price + " €"}
        </div>
      </div>
      <div className="product-actions" style={{ marginTop: "auto" }}>
        <button
          onClick={() => onAddToCart(product)}
          disabled={!isAvailable}
          className={`btn ${isAvailable ? "btn-primary" : "btn-disabled"}`}
          style={{
            marginTop: 12,
            padding: "6px 14px",
            borderRadius: 6,
            fontWeight: 500,
            fontSize: 13,
            background: isAvailable ? "#2ecc40" : "#ccc",
            color: isAvailable ? "#fff" : "#888",
            border: "none",
            cursor: isAvailable ? "pointer" : "not-allowed"
          }}
        >
          {isAvailable ? "Ajouter au panier" : "Indisponible"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
