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
            Découvrez nos cafés artisanaux et nos délicieuses pâtisseries dans
            une ambiance chaleureuse et conviviale.
          </p>
          <div className="hero-buttons">
            <Link to="/menu" className="btn btn-primary btn-large">
              Découvrir notre menu
            </Link>
            {!user?.isAuthenticated && (
              <Link to="/register" className="btn btn-outline btn-large">
                Rejoignez-nous
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
              <div className="specialty-icon">☕</div>
              <h3>Cafés Premium</h3>
              <p>
                Sélection de grains d'exception torréfiés avec passion pour un
                goût unique et authentique.
              </p>
            </div>
            <div className="specialty-card">
              <div className="specialty-icon">🥐</div>
              <h3>Pâtisseries Fraîches</h3>
              <p>
                Viennoiseries et pâtisseries préparées quotidiennement par nos
                artisans boulangers.
              </p>
            </div>
            <div className="specialty-card">
              <div className="specialty-icon">🍰</div>
              <h3>Desserts Maison</h3>
              <p>
                Créations gourmandes et desserts traditionnels préparés avec des
                ingrédients de qualité.
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
              <h2>Notre Histoire</h2>
              <p>
                Depuis 2020, Café Délice vous accueille dans un cadre chaleureux
                pour partager notre passion du café d'exception. Chaque tasse
                raconte une histoire, chaque moment devient un souvenir
                précieux.
              </p>
              <p>
                Notre équipe sélectionne avec soin les meilleurs grains du monde
                entier pour vous offrir une expérience gustative inoubliable.
              </p>
              <Link to="/about" className="btn btn-secondary">
                En savoir plus
              </Link>
            </div>
            <div className="about-stats">
              <div className="stat">
                <h3>1000+</h3>
                <p>Clients satisfaits</p>
              </div>
              <div className="stat">
                <h3>50+</h3>
                <p>Variétés de café</p>
              </div>
              <div className="stat">
                <h3>4.8/5</h3>
                <p>Note moyenne</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Horaires */}
      <section className="hours">
        <div className="container">
          <h2 className="section-title">Nos Horaires</h2>
          <div className="hours-grid">
            <div className="hours-card">
              <h3>En Semaine</h3>
              <div className="hours-info">
                <p>
                  <strong>Lundi - Vendredi</strong>
                </p>
                <p>7h00 - 19h00</p>
              </div>
            </div>
            <div className="hours-card">
              <h3>Week-end</h3>
              <div className="hours-info">
                <p>
                  <strong>Samedi</strong>
                </p>
                <p>8h00 - 20h00</p>
                <p>
                  <strong>Dimanche</strong>
                </p>
                <p>8h00 - 18h00</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section CTA */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Prêt à découvrir nos saveurs ?</h2>
            <p>Explorez notre carte et commandez vos produits préférés</p>
            <div className="cta-buttons">
              <Link to="/menu" className="btn btn-primary">
                Voir le menu
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
