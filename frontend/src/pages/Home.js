import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      {/* Section Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Bienvenue chez <span className="highlight">Café Délice</span>
          </h1>
          <p className="hero-subtitle">
            Votre grossiste spécialisé dans la vente de café en poudre premium.
            Découvrez notre large sélection de cafés du monde entier, torréfiés
            avec expertise pour professionnels et particuliers.
          </p>
          <div className="hero-buttons">
            <Link to="/menu" className="btn btn-primary btn-large">
              Parcourir nos cafés
            </Link>
            {!user?.isAuthenticated && (
              <Link to="/register" className="btn btn-outline btn-large">
                Créer un compte
              </Link>
            )}
          </div>
        </div>
        <div className="hero-image">
          <div className="coffee-illustration">☕</div>
        </div>
      </section>

      {/* Section Spécialités */}
      <section className="specialties">
        <div className="container">
          <h2 className="section-title">Nos Spécialités</h2>
          <div className="specialties-grid">
            <div className="specialty-card">
              <div className="specialty-icon">🌍</div>
              <h3>Cafés du Monde</h3>
              <p>
                Une sélection rigoureuse de cafés en poudre provenant des
                meilleures plantations d'Amérique du Sud, d'Afrique et d'Asie.
              </p>
            </div>
            <div className="specialty-card">
              <div className="specialty-icon">⚖️</div>
              <h3>Vente en Gros</h3>
              <p>
                Commandes en grande quantité avec des prix dégressifs pour les
                professionnels, restaurants, hôtels et distributeurs.
              </p>
            </div>
            <div className="specialty-card">
              <div className="specialty-icon">🔥</div>
              <h3>Torréfaction Artisanale</h3>
              <p>
                Tous nos cafés sont torréfiés selon des méthodes traditionnelles
                et conditionnés sous vide pour préserver leur fraîcheur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section À propos */}
      <section className="about-preview">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>Notre Expertise</h2>
              <p>
                Depuis 2020, Café Délice est votre partenaire de confiance pour
                l'approvisionnement en café en poudre de qualité supérieure.
                Nous sélectionnons nos grains directement auprès des producteurs
                pour garantir authenticité et excellence.
              </p>
              <p>
                Spécialisés dans la distribution B2B et B2C, nous proposons des
                conditionnements adaptés à tous vos besoins, du sachet de 250g
                aux sacs de 25kg pour les professionnels.
              </p>
              <Link to="/about" className="btn btn-secondary">
                En savoir plus
              </Link>
            </div>
            <div className="about-stats">
              <div className="stat">
                <h3>500+</h3>
                <p>Clients professionnels</p>
              </div>
              <div className="stat">
                <h3>80+</h3>
                <p>Variétés de café</p>
              </div>
              <div className="stat">
                <h3>15+</h3>
                <p>Pays d'origine</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Horaires */}
      <section className="hours">
        <div className="container">
          <h2 className="section-title">Horaires de Service</h2>
          <div className="hours-grid">
            <div className="hours-card">
              <h3>Bureau Commercial</h3>
              <div className="hours-info">
                <p>
                  <strong>Lundi - Vendredi</strong>
                </p>
                <p>8h00 - 18h00</p>
                <p>
                  <strong>Samedi</strong>
                </p>
                <p>8h00 - 12h00</p>
              </div>
            </div>
            <div className="hours-card">
              <h3>Entrepôt & Livraisons</h3>
              <div className="hours-info">
                <p>
                  <strong>Lundi - Vendredi</strong>
                </p>
                <p>7h00 - 17h00</p>
                <p>
                  <strong>Livraisons express</strong>
                </p>
                <p>Disponibles sur demande</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section CTA */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Prêt à découvrir nos cafés ?</h2>
            <p>
              Explorez notre catalogue complet et passez commande en quelques
              clics
            </p>
            <div className="cta-buttons">
              <Link to="/menu" className="btn btn-primary">
                Voir le catalogue
              </Link>
              {user?.isAuthenticated && (
                <Link to="/cart" className="btn btn-outline">
                  Mon panier
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
