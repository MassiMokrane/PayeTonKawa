import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="container">
        <div className="nav-brand">
          <Link to="/" className="logo">
            <span className="logo-icon">☕</span>
            <span className="logo-text">Café Délice</span>
          </Link>
        </div>

        <nav className="nav-menu">
          <Link to="/" className="nav-link">
            Accueil
          </Link>
          <Link to="/menu" className="nav-link">
            Produits
          </Link>
          <Link to="/about" className="nav-link">
            À propos
          </Link>
          <Link to="/contact" className="nav-link">
            Contact
          </Link>

          {user?.isAuthenticated && (
            <Link to="/cart" className="nav-link cart-link">
              <span className="cart-icon">🛒</span>
              Panier
            </Link>
          )}
        </nav>

        <div className="auth-menu">
          {user?.isAuthenticated ? (
            <div className="user-menu">
              <span className="welcome-text">
                Bonjour {user.isAdmin ? "Admin" : "Client"}!
              </span>

              {user.isAdmin && (
                <Link to="/admin" className="btn btn-admin">
                  Dashboard Admin
                </Link>
              )}

              <Link to="/profile" className="btn btn-outline">
                Profil
              </Link>

              <button onClick={handleLogout} className="btn btn-secondary">
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">
                Connexion
              </Link>
              <Link to="/register" className="btn btn-primary">
                Inscription
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
