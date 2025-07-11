import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import Loading from "../components/common/Loading";
import userService from "../services/userService";
import orderService from "../services/orderService";

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({ nom: "", prenom: "", email: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({
    commandes: 0,
    favori: "N/A",
    points: 0,
  });

  // Charger les infos utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      if (!user?.id) return;

      try {
        const data = await userService.getUserById(user.id);
        setUserData(data);
        setFormData({
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
        });
      } catch (error) {
        toast.error("Impossible de charger les données utilisateur.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [user]);

  // Charger les statistiques
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        const orders = await orderService.getUserOrders(user.id);
        const productCounts = {};

        orders.forEach((order) => {
          order.items.forEach((item) => {
            const name = item.name || "Produit";
            productCounts[name] = (productCounts[name] || 0) + item.quantity;
          });
        });

        const commandes = orders.length;
        const points = commandes * 5;

        let favori = "Aucun";
        if (Object.keys(productCounts).length > 0) {
          favori = Object.entries(productCounts).sort(
            (a, b) => b[1] - a[1]
          )[0][0];
        }

        setStats({ commandes, favori, points });
      } catch (err) {
        console.error("Erreur statistiques utilisateur:", err);
      }
    };

    fetchStats();
  }, [user]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await userService.updateUser(user.id, formData);
      setUserData({ ...userData, ...formData });
      toast.success("Profil mis à jour avec succès !");
      setIsEditing(false);
    } catch (error) {
      toast.error("Échec de la mise à jour du profil.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nom: userData.nom,
      prenom: userData.prenom,
      email: userData.email,
    });
    setIsEditing(false);
  };

  if (loading || !userData)
    return <Loading message="Chargement du profil..." />;

  return (
    <div className="profile">
      <div className="container">
        <div className="profile-header">
          <h1 className="page-title">Mon Profil</h1>
          <p className="page-subtitle">Gérez vos informations personnelles</p>
        </div>

        <div className="profile-content">
          {/* Informations de base */}
          <div className="profile-card">
            <div className="profile-avatar">
              <span className="avatar-icon">
                {userData.role === "admin" ? "👨‍💼" : "👤"}
              </span>
            </div>

            <div className="profile-info">
              <h2>
                {userData.prenom} {userData.nom}
              </h2>
              <p className="profile-role">
                {userData.role === "admin" ? "Administrateur" : "Client"}
              </p>
              <p className="profile-email">{userData.email}</p>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
              >
                Modifier le profil
              </button>
            )}
          </div>

          {/* Formulaire d'édition */}
          {isEditing && (
            <div className="profile-form">
              <h3>Modifier les informations</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nom" className="form-label">
                      Nom
                    </label>
                    <input
                      type="text"
                      id="nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="prenom" className="form-label">
                      Prénom
                    </label>
                    <input
                      type="text"
                      id="prenom"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-outline"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Sauvegarder
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Statistiques utilisateur */}
          <div className="profile-stats">
            <h3>Statistiques</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-content">
                  <h4>Commandes</h4>
                  <p className="stat-number">{stats.commandes}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-content">
                  <h4>Points fidélité</h4>
                  <p className="stat-number">{stats.points}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <h4>Favori</h4>
                  <p className="stat-number">{stats.favori}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
