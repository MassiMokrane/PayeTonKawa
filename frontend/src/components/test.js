// Si certains composants manquent, voici des versions basiques :

// components/common/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <nav className="navbar">
        <div className="nav-brand">
          <Link to="/">Mon App</Link>
        </div>
        <ul className="nav-links">
          <li><Link to="/">Accueil</Link></li>
          <li><Link to="/menu">Menu</Link></li>
          <li><Link to="/about">À propos</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          {user ? (
            <>
              <li><Link to="/profile">Profil</Link></li>
              {user.isAdmin && <li><Link to="/admin">Admin</Link></li>}
              <li><button onClick={logout}>Déconnexion</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login">Connexion</Link></li>
              <li><Link to="/register">Inscription</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};


// components/common/Footer.js
import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2024 Mon App. Tous droits réservés.</p>
      </div>
    </footer>
  );
};


// components/common/Loading.js
import React from 'react';

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    </div>
  );
};

export default Loading;

// components/common/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRoute;

// pages/Home.js
import React from 'react';

const Home = () => {
  return (
    <div className="home">
      <h1>Bienvenue sur notre site</h1>
      <p>Ceci est la page d'accueil.</p>
    </div>
  );
};

export default Home;

// pages/Menu.js
import React from 'react';

const Menu = () => {
  return (
    <div className="menu">
      <h1>Notre Menu</h1>
      <p>Découvrez nos produits.</p>
    </div>
  );
};

export default Menu;

// pages/About.js
import React from 'react';

const About = () => {
  return (
    <div className="about">
      <h1>À propos de nous</h1>
      <p>Voici notre histoire.</p>
    </div>
  );
};

export default About;

// pages/Contact.js
import React from 'react';

const Contact = () => {
  return (
    <div className="contact">
      <h1>Contactez-nous</h1>
      <p>Nous sommes là pour vous aider.</p>
    </div>
  );
};

export default Contact;

// pages/Profile.js
import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  
  return (
    <div className="profile">
      <h1>Mon Profil</h1>
      <p>Bienvenue, {user?.role}!</p>
    </div>
  );
};

export default Profile;

// components/admin/AdminDashboard.js
import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h1>Tableau de bord Admin</h1>
      <p>Panneau d'administration.</p>
    </div>
  );
};

export default Header;
      export default Footer;
export default AdminDashboard;