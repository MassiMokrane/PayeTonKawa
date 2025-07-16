const app = require('./app');
const { connectDB } = require('./config/db');
const { initializeProductModel } = require('./models/product.model');
const PORT = process.env.PORT || 5001;

console.log('=== [DEBUG] server.js lancé ===');

// Démarrage asynchrone avec initialisation DB
const startServer = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`[DEBUG] Tentative ${i + 1}/${retries} : Connexion à la DB...`);
      await connectDB();
      console.log('[DEBUG] Connexion DB OK');
      console.log('[DEBUG] Initialisation du modèle Product...');
      await initializeProductModel();
      console.log('[DEBUG] Modèle Product initialisé');
      console.log('[DEBUG] Prêt à lancer app.listen');
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ Product-service démarré sur http://localhost:${PORT}`);
      });
      break; // Sort de la boucle si succès
    } catch (error) {
      console.error(`❌ Tentative ${i + 1}/${retries} échouée:`, error.message);
      if (i === retries - 1) {
        console.error("❌ Impossible de démarrer le service après", retries, "tentatives");
        process.exit(1);
      }
      console.log("⏳ Nouvelle tentative dans 5 secondes...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

startServer(); 