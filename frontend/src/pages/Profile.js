import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import Loading from "../components/common/Loading";

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    nom: "",
    prenom: "",
    email: "",
    role: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
  });

  useEffect(() => {
    // Simuler le chargement des données utilisateur
    setTimeout(() => {
      const mockUserData = {
        id: 1,
        nom: "Dupont",
        prenom: "Jean",
        email: user?.isAdmin ? "admin@test.com" : "client@test.com",
        role: user?.role || "client",
      };
      setUserData(mockUserData);
      setFormData({
        nom: mockUserData.nom,
        prenom: mockUserData.prenom,
        email: mockUserData.email,
      });
      setLoading(false);
    }, 1000);
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulation de mise à jour
    setTimeout(() => {
      setUserData({
        ...userData,
        ...formData,
      });
      setIsEditing(false);
      setLoading(false);
      toast.success("Profil mis à jour avec succès !");
    }, 1000);
  };

  const handleCancel = () => {
    setFormData({
      nom: userData.nom,
      prenom: userData.prenom,
      email: userData.email,
    });
    setIsEditing(false);
  };

  if (loading) {
    return <Loading message="Chargement du profil..." />;
  }

  return (
    <div className="profile">
      <div className="container">
        <div className="profile-header">
          <h1 className="page-title">Mon Profil</h1>
          <p className="page-subtitle">Gérez vos informations personnelles</p>
        </div>

        <div className="profile-content">
          {/* Profile Info */}
          <div className="profile-card">
            <div className="profile-avatar">
              <span className="avatar-icon">{user?.isAdmin ? "👨‍💼" : "👤"}</span>
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

          {/* Edit Form */}
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
                    className="btn btn-secondary"
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

          {/* Stats Section */}
          <div className="profile-stats">
            <h3>Statistiques</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-content">
                  <h4>Commandes</h4>
                  <p className="stat-number">12</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-content">
                  <h4>Points fidélité</h4>
                  <p className="stat-number">248</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <h4>Favori</h4>
                  <p className="stat-number">Cappuccino</p>
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
