import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import Loading from "../../components/common/Loading";
import orderService from "../../services/orderService";
// import "./OrderList.css";

const OrderList = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let data;

      if (user?.role === "admin") {
        data = await orderService.getAllOrders();
      } else {
        data = await orderService.getUserOrders();
      }

      setOrders(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des commandes");
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success("Statut mis à jour avec succès");
      fetchOrders(); // Recharger les commandes
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut");
      console.error("Erreur:", error);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette commande ?")) {
      return;
    }

    try {
      await orderService.cancelOrder(orderId);
      toast.success("Commande annulée avec succès");
      fetchOrders();
    } catch (error) {
      toast.error("Erreur lors de l'annulation de la commande");
      console.error("Erreur:", error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      confirmed: "#3b82f6",
      preparing: "#f97316",
      ready: "#10b981",
      delivered: "#059669",
      cancelled: "#ef4444",
    };
    return colors[status] || "#6b7280";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "En attente",
      confirmed: "Confirmée",
      preparing: "En préparation",
      ready: "Prête",
      delivered: "Livrée",
      cancelled: "Annulée",
    };
    return texts[status] || status;
  };

  const canCancelOrder = (order) => {
    return order.status === "pending" || order.status === "confirmed";
  };

  const filteredOrders = orders.filter((order) => {
    return filterStatus === "all" || order.status === filterStatus;
  });

  const OrderCard = ({ order }) => (
    <div className="order-card">
      <div className="order-header">
        <div className="order-info">
          <h3 className="order-id">Commande #{order.id}</h3>
          <p className="order-date">
            {new Date(order.createdAt).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="order-status">
          <span
            className="status-badge"
            style={{ backgroundColor: getStatusColor(order.status) }}
          >
            {getStatusText(order.status)}
          </span>
        </div>
      </div>

      <div className="order-details">
        {user?.role === "admin" && (
          <div className="customer-info">
            <p>
              <strong>Client:</strong> {order.customerInfo?.name}
            </p>
            <p>
              <strong>Email:</strong> {order.customerInfo?.email}
            </p>
            <p>
              <strong>Téléphone:</strong> {order.customerInfo?.phone}
            </p>
          </div>
        )}

        <div className="order-items">
          <h4>Articles commandés:</h4>
          {order.items?.map((item, index) => (
            <div key={index} className="order-item">
              <span className="item-name">{item.name}</span>
              <span className="item-quantity">x{item.quantity}</span>
              <span className="item-price">
                {orderService.formatPrice(item.price * item.quantity)} €
              </span>
            </div>
          ))}
        </div>

        <div className="order-total">
          <strong>Total: {orderService.formatPrice(order.total)} €</strong>
        </div>

        {order.customerInfo?.address && (
          <div className="delivery-info">
            <p>
              <strong>Adresse de livraison:</strong>
            </p>
            <p>{order.customerInfo.address}</p>
          </div>
        )}

        {order.customerInfo?.notes && (
          <div className="order-notes">
            <p>
              <strong>Notes:</strong> {order.customerInfo.notes}
            </p>
          </div>
        )}
      </div>

      <div className="order-actions">
        <button
          onClick={() => setSelectedOrder(order)}
          className="btn btn-outline"
        >
          Voir détails
        </button>

        {user?.role === "admin" && (
          <div className="admin-actions">
            <select
              value={order.status}
              onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
              className="status-select"
            >
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmée</option>
              <option value="preparing">En préparation</option>
              <option value="ready">Prête</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
        )}

        {canCancelOrder(order) && (
          <button
            onClick={() => handleCancelOrder(order.id)}
            className="btn btn-danger"
          >
            Annuler
          </button>
        )}
      </div>
    </div>
  );

  const OrderModal = ({ order, onClose }) => (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Détails de la commande #{order.id}</h2>
          <button onClick={onClose} className="close-btn">
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="order-detail-section">
            <h3>Informations générales</h3>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(order.createdAt).toLocaleString("fr-FR")}
            </p>
            <p>
              <strong>Statut:</strong>
              <span
                className="status-badge"
                style={{ backgroundColor: getStatusColor(order.status) }}
              >
                {getStatusText(order.status)}
              </span>
            </p>
            <p>
              <strong>Total:</strong> {orderService.formatPrice(order.total)} €
            </p>
          </div>

          <div className="order-detail-section">
            <h3>Informations client</h3>
            <p>
              <strong>Nom:</strong> {order.customerInfo?.name}
            </p>
            <p>
              <strong>Email:</strong> {order.customerInfo?.email}
            </p>
            <p>
              <strong>Téléphone:</strong> {order.customerInfo?.phone}
            </p>
            <p>
              <strong>Adresse:</strong> {order.customerInfo?.address}
            </p>
            {order.customerInfo?.notes && (
              <p>
                <strong>Notes:</strong> {order.customerInfo.notes}
              </p>
            )}
          </div>

          <div className="order-detail-section">
            <h3>Articles commandés</h3>
            <div className="detailed-items">
              {order.items?.map((item, index) => (
                <div key={index} className="detailed-item">
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    {item.category && (
                      <p className="item-category">{item.category}</p>
                    )}
                    {item.description && (
                      <p className="item-description">{item.description}</p>
                    )}
                  </div>
                  <div className="item-pricing">
                    <p>
                      Prix unitaire: {orderService.formatPrice(item.price)} €
                    </p>
                    <p>Quantité: {item.quantity}</p>
                    <p>
                      <strong>
                        Sous-total:{" "}
                        {orderService.formatPrice(item.price * item.quantity)} €
                      </strong>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <Loading message="Chargement des commandes..." />;

  return (
    <div className="orders-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            {user?.role === "admin" ? "Toutes les commandes" : "Mes commandes"}
          </h1>
          <p className="page-subtitle">
            {filteredOrders.length} commande
            {filteredOrders.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="orders-filters">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmées</option>
            <option value="preparing">En préparation</option>
            <option value="ready">Prêtes</option>
            <option value="delivered">Livrées</option>
            <option value="cancelled">Annulées</option>
          </select>

          <button onClick={fetchOrders} className="btn btn-outline">
            Actualiser
          </button>
        </div>

        <div className="orders-list">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <div className="no-orders">
              <div className="no-orders-icon">📋</div>
              <h3>Aucune commande trouvée</h3>
              <p>
                {filterStatus === "all"
                  ? "Vous n'avez pas encore passé de commande"
                  : `Aucune commande avec le statut "${getStatusText(
                      filterStatus
                    )}"`}
              </p>
              {user?.role !== "admin" && (
                <a href="/menu" className="btn btn-primary">
                  Découvrir le menu
                </a>
              )}
            </div>
          )}
        </div>

        {selectedOrder && (
          <OrderModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </div>
    </div>
  );
};

export default OrderList;
