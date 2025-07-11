import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import Loading from "../../components/common/Loading";
import productService from "../../services/productService";
import orderService from "../../services/orderService";

const Cart = () => {
  const { user } = useAuth();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    checkout,
    isLoading,
  } = useCart();

  const [orders, setOrders] = useState([]);
  console.log("Utilisateur connecté :", user);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user?.isAuthenticated) {
        try {
          const data = await orderService.getUserOrders(user.id);
          setOrders(data);
        } catch (error) {
          console.error("Erreur lors du chargement des commandes:", error);
        }
      }
    };

    fetchOrders();
  }, [user]);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      toast.info("Produit retiré du panier");
      return;
    }

    const product = cartItems.find((item) => item.id === productId);
    if (product && newQuantity > product.quantity) {
      toast.warning(`Stock maximum: ${product.quantity}`);
      updateQuantity(productId, product.quantity);
      return;
    }

    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId, productName) => {
    removeFromCart(productId);
    toast.success(`${productName} retiré du panier`);
  };

  const handleClearCart = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vider le panier ?")) {
      clearCart();
      toast.success("Panier vidé");
    }
  };

  const handleCheckout = async () => {
    if (!user?.isAuthenticated) {
      toast.error("Veuillez vous connecter pour finaliser la commande");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }

    try {
      const result = await checkout();
      toast.success("Commande créée avec succès !");
      console.log("Commande créée:", result);
    } catch (error) {
      toast.error("Erreur lors de la création de la commande");
      console.error("Erreur checkout:", error);
    }
  };

  const CartItem = ({ item }) => {
    const imageUrl = productService.getImageUrl(item.image);
    const itemTotal = item.price * item.quantity;

    return (
      <div className="cart-item">
        <div className="item-image">
          {imageUrl ? (
            <img
              src={imageUrl}
              crossOrigin="anonymous"
              alt={item.name}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="item-icon-fallback"
            style={{
              display: !imageUrl ? "flex" : "none",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              fontSize: "2rem",
              color: "#999",
            }}
          >
            📦
          </div>
        </div>

        <div className="item-details">
          <h4 className="item-name">{item.name}</h4>
          {item.category && (
            <span className="item-category">{item.category}</span>
          )}
          <p className="item-price">
            {productService.formatPrice(item.price)} € / unité
          </p>
        </div>

        <div className="item-quantity">
          <button
            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
            className="quantity-btn"
          >
            -
          </button>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) =>
              handleQuantityChange(item.id, parseInt(e.target.value) || 1)
            }
            min="1"
            max={item.quantity}
            className="quantity-input"
          />
          <button
            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
            disabled={item.quantity >= item.quantity}
            className="quantity-btn"
          >
            +
          </button>
        </div>

        <div className="item-total">
          <p className="total-price">
            {productService.formatPrice(itemTotal)} €
          </p>
          <button
            onClick={() => handleRemoveItem(item.id, item.name)}
            className="remove-btn"
          >
            🗑️
          </button>
        </div>
      </div>
    );
  };

  const OrderHistory = () => {
    if (!orders || orders.length === 0) return null;

    return (
      <div className="order-history">
        <h2>Mes commandes précédentes</h2>
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <h4>
              Commande #{order.id} -{" "}
              {new Date(order.createdAt).toLocaleString()}
            </h4>
            <p>
              Statut:{" "}
              <span
                className={`status-badge ${
                  order.status === "Livrée"
                    ? "bg-success"
                    : order.status === "En attente"
                    ? "bg-warning"
                    : "bg-info"
                }`}
              >
                {order.status}
              </span>
            </p>
            <p>Total: {productService.formatPrice(order.total)} €</p>
            <ul>
              {order.items.map((item) => (
                <li key={item.id}>
                  Produit ID: {item.productId} | Quantité: {item.quantity} |
                  Prix unitaire: {item.unitPrice} €
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) return <Loading message="Traitement de votre commande..." />;

  return (
    <div className="cart-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Mon Panier</h1>
          <p className="page-subtitle">
            {cartItems.length} article{cartItems.length > 1 ? "s" : ""} dans
            votre panier
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h3>Votre panier est vide</h3>
            <p>Découvrez nos produits et ajoutez-les à votre panier</p>
            <a href="/menu" className="btn btn-primary">
              Voir le menu
            </a>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-card">
                <h3>Résumé de la commande</h3>

                <div className="summary-line">
                  <span>Sous-total:</span>
                  <span>{productService.formatPrice(getCartTotal())} €</span>
                </div>

                <div className="summary-line total">
                  <span>Total:</span>
                  <span>{productService.formatPrice(getCartTotal())} €</span>
                </div>

                <div className="cart-actions">
                  <button onClick={handleClearCart} className="btn btn-outline">
                    Vider le panier
                  </button>

                  {user?.isAuthenticated ? (
                    <button
                      onClick={handleCheckout}
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? "Traitement..." : "Passer commande"}
                    </button>
                  ) : (
                    <div className="auth-required">
                      <p>Connectez-vous pour finaliser votre commande</p>
                      <a href="/login" className="btn btn-primary">
                        Se connecter
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Historique des commandes */}
        {user?.isAuthenticated && <OrderHistory />}
      </div>
    </div>
  );
};

export default Cart;
