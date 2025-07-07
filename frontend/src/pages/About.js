import React from "react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="about-page">
      <div className="container">
        {/* Section Hero */}
        <section className="about-hero">
          <div className="about-hero-content">
            <h1 className="page-title">À Propos de Café Délice</h1>
            <p className="page-subtitle">
              Une passion pour le café d'exception et l'art de vivre à la
              française
            </p>
          </div>
        </section>

        {/* Section Histoire */}
        <section className="our-story">
          <div className="story-content">
            <div className="story-text">
              <h2>Notre Histoire</h2>
              <p>
                Fondé en 2020 par Marie et Pierre Dubois, Café Délice est né
                d'une passion commune pour le café d'exception et l'hospitalité
                française. Après avoir voyagé à travers le monde pour découvrir
                les meilleurs terroirs de café, nous avons décidé de créer un
                lieu unique où tradition et innovation se rencontrent.
              </p>
              <p>
                Notre engagement envers la qualité nous pousse à sélectionner
                rigoureusement chaque grain, à travailler directement avec les
                producteurs et à torréfier nos cafés de manière artisanale.
                Chaque tasse servie chez Café Délice raconte une histoire, celle
                d'un terroir, d'un producteur et de notre savoir-faire.
              </p>
            </div>
            <div className="story-image">
              <div className="image-placeholder">
                <div className="coffee-beans">☕</div>
                <p>Nos fondateurs Marie & Pierre</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section Valeurs */}
        <section className="our-values">
          <h2 className="section-title">Nos Valeurs</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🌱</div>
              <h3>Durabilité</h3>
              <p>
                Nous nous engageons pour un commerce équitable et des pratiques
                respectueuses de l'environnement. Nos partenaires producteurs
                sont sélectionnés pour leur engagement écologique.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">⭐</div>
              <h3>Qualité</h3>
              <p>
                Seuls les meilleurs grains sont sélectionnés pour nos mélanges.
                Chaque étape, de la sélection à la torréfaction, est réalisée
                avec la plus grande attention.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Convivialité</h3>
              <p>
                Café Délice est un lieu de rencontre et de partage. Nous créons
                une atmosphère chaleureuse où chacun se sent chez soi et peut
                savourer un moment de détente.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🎯</div>
              <h3>Excellence</h3>
              <p>
                L'excellence guide chacune de nos actions. De la préparation de
                nos boissons à l'accueil de nos clients, nous visons la
                perfection dans chaque détail.
              </p>
            </div>
          </div>
        </section>

        {/* Section Équipe */}
        <section className="our-team">
          <h2 className="section-title">Notre Équipe</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-photo">👩‍💼</div>
              <h3>Marie Dubois</h3>
              <p className="member-role">Co-fondatrice & Directrice</p>
              <p className="member-description">
                Experte en torréfaction et passionnée de café depuis 15 ans.
                Marie supervise la sélection des grains et la formation de
                l'équipe.
              </p>
            </div>
            <div className="team-member">
              <div className="member-photo">👨‍🍳</div>
              <h3>Pierre Dubois</h3>
              <p className="member-role">Co-fondateur & Chef Barista</p>
              <p className="member-description">
                Ancien champion national de Latte Art, Pierre forme nos baristas
                et développe nos recettes signature.
              </p>
            </div>
            <div className="team-member">
              <div className="member-photo">👩‍🍳</div>
              <h3>Sophie Martin</h3>
              <p className="member-role">Chef Pâtissière</p>
              <p className="member-description">
                Diplômée des meilleurs établissements parisiens, Sophie crée nos
                pâtisseries et desserts maison quotidiennement.
              </p>
            </div>
            <div className="team-member">
              <div className="member-photo">👨‍💼</div>
              <h3>Lucas Bernard</h3>
              <p className="member-role">Responsable Commercial</p>
              <p className="member-description">
                Spécialiste des relations producteurs, Lucas voyage
                régulièrement pour dénicher les meilleurs cafés du monde.
              </p>
            </div>
          </div>
        </section>

        {/* Section Process */}
        <section className="our-process">
          <h2 className="section-title">Notre Processus</h2>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <h3>Sélection</h3>
              <p>
                Nous visitons les plantations et sélectionnons les meilleurs
                grains selon des critères stricts de qualité et d'éthique.
              </p>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <h3>Torréfaction</h3>
              <p>
                Torréfaction artisanale en petites quantités pour préserver les
                arômes et révéler le caractère unique de chaque origine.
              </p>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <h3>Préparation</h3>
              <p>
                Nos baristas experts préparent chaque boisson avec passion et
                précision, en respectant les traditions et techniques
                spécifiques.
              </p>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <h3>Dégustation</h3>
              <p>
                Savourez votre café dans notre cadre chaleureux, accompagné de
                nos pâtisseries artisanales préparées sur place.
              </p>
            </div>
          </div>
        </section>

        {/* Section CTA */}
        <section className="about-cta">
          <div className="cta-content">
            <h2>Venez Nous Rencontrer</h2>
            <p>
              Nous serions ravis de vous accueillir dans notre établissement et
              de vous faire découvrir notre passion pour le café.
            </p>
            <div className="cta-buttons">
              <Link to="/contact" className="btn btn-primary">
                Nous Contacter
              </Link>
              <Link to="/menu" className="btn btn-outline">
                Découvrir Notre Menu
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
