import React, { useState } from "react";
import { toast } from "react-toastify";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simuler l'envoi du formulaire
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Votre message a été envoyé avec succès!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Contactez-nous</h1>
          <p className="page-subtitle">
            Nous sommes là pour répondre à toutes vos questions
          </p>
        </div>

        <div className="contact-content">
          {/* Informations de contact */}
          <div className="contact-info">
            <h2>Nos Coordonnées</h2>

            <div className="contact-item">
              <div className="contact-icon">📍</div>
              <div className="contact-details">
                <h3>Adresse</h3>
                <p>
                  123 Rue du Café
                  <br />
                  75001 Paris, France
                </p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <div className="contact-details">
                <h3>Téléphone</h3>
                <p>01 23 45 67 89</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">✉️</div>
              <div className="contact-details">
                <h3>Email</h3>
                <p>contact@cafedelice.fr</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">🕐</div>
              <div className="contact-details">
                <h3>Horaires d'ouverture</h3>
                <div className="hours-list">
                  <p>
                    <strong>Lundi - Vendredi:</strong> 7h00 - 19h00
                  </p>
                  <p>
                    <strong>Samedi:</strong> 8h00 - 20h00
                  </p>
                  <p>
                    <strong>Dimanche:</strong> 8h00 - 18h00
                  </p>
                </div>
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div className="social-links">
              <h3>Suivez-nous</h3>
              <div className="social-icons">
                <a href="#" className="social-link">
                  📘 Facebook
                </a>
                <a href="#" className="social-link">
                  📷 Instagram
                </a>
                <a href="#" className="social-link">
                  🐦 Twitter
                </a>
              </div>
            </div>
          </div>

          {/* Formulaire de contact */}
          <div className="contact-form">
            <h2>Envoyez-nous un message</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Votre nom"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="01 23 45 67 89"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject" className="form-label">
                    Sujet *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Choisissez un sujet</option>
                    <option value="info">Demande d'information</option>
                    <option value="reservation">Réservation</option>
                    <option value="event">Événement privé</option>
                    <option value="partnership">Partenariat</option>
                    <option value="complaint">Réclamation</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Écrivez votre message ici..."
                  rows="6"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? "Envoi en cours..." : "Envoyer le message"}
              </button>
            </form>
          </div>
        </div>

        {/* Section FAQ */}
        <div className="faq-section">
          <h2>Questions Fréquentes</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>Proposez-vous des options végétariennes/véganes ?</h3>
              <p>
                Oui ! Nous proposons du lait végétal (amande, soja, avoine) pour
                vos boissons, ainsi que des pâtisseries véganes préparées
                quotidiennement.
              </p>
            </div>
            <div className="faq-item">
              <h3>Peut-on privatiser l'espace pour un événement ?</h3>
              <p>
                Absolument ! Nous proposons la privatisation de notre espace
                pour vos événements privés. Contactez-nous pour discuter de vos
                besoins.
              </p>
            </div>
            <div className="faq-item">
              <h3>Acceptez-vous les cartes de crédit ?</h3>
              <p>
                Oui, nous acceptons toutes les cartes de crédit principales,
                ainsi que les paiements en espèces et par carte bancaire.
              </p>
            </div>
            <div className="faq-item">
              <h3>Y a-t-il un parking disponible ?</h3>
              <p>
                Nous avons un parking partagé à proximité. Des places de
                stationnement sont également disponibles dans la rue.
              </p>
            </div>
          </div>
        </div>

        {/* Section Localisation */}
        <div className="location-section">
          <h2>Notre Localisation</h2>
          <div className="location-content">
            <div className="map-placeholder">
              <div className="map-info">
                <p>📍 123 Rue du Café, 75001 Paris</p>
                <p>🚇 Métro: Châtelet-Les Halles (lignes 1, 4, 7, 11, 14)</p>
                <p>🚌 Bus: 21, 67, 69, 74, 85</p>
                <p>🚗 Parking public à 2 min à pied</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
