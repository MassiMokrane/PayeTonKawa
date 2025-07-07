// Formater le prix en euros
export const formatPrice = (price) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

// Formater la date
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Capitaliser la première lettre
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Tronquer le texte
export const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Valider l'email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Valider le mot de passe
export const validatePassword = (password) => {
  // Au moins 6 caractères
  if (password.length < 6) {
    return "Le mot de passe doit contenir au moins 6 caractères";
  }

  // Au moins une lettre et un chiffre
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasLetter || !hasNumber) {
    return "Le mot de passe doit contenir au moins une lettre et un chiffre";
  }

  return null; // Valide
};

// Générer un ID unique
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Délai d'attente
export const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Mélanger un tableau
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Grouper par propriété
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {});
};

// Débounce fonction
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Vérifier si l'utilisateur est sur mobile
export const isMobile = () => {
  return window.innerWidth <= 768;
};

// Copier dans le presse-papiers
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Erreur lors de la copie:", err);
    return false;
  }
};

// Calculer la note moyenne
export const calculateAverageRating = (ratings) => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating.score, 0);
  return (sum / ratings.length).toFixed(1);
};

// Statuts de commande avec traductions
export const ORDER_STATUS = {
  pending: "En attente",
  confirmed: "Confirmée",
  preparing: "En préparation",
  ready: "Prête",
  delivered: "Livrée",
  cancelled: "Annulée",
};

// Couleurs pour les statuts
export const getStatusColor = (status) => {
  const colors = {
    pending: "#ffc107",
    confirmed: "#17a2b8",
    preparing: "#fd7e14",
    ready: "#28a745",
    delivered: "#6f42c1",
    cancelled: "#dc3545",
  };
  return colors[status] || "#6c757d";
};

// Catégories de produits
export const PRODUCT_CATEGORIES = {
  coffee: "Café",
  tea: "Thé",
  pastry: "Pâtisserie",
  sandwich: "Sandwich",
  salad: "Salade",
  drink: "Boisson",
  dessert: "Dessert",
};

// Tailles de produits
export const PRODUCT_SIZES = {
  small: "Petit",
  medium: "Moyen",
  large: "Grand",
};

// Méthodes de paiement
export const PAYMENT_METHODS = {
  cash: "Espèces",
  card: "Carte bancaire",
  mobile: "Paiement mobile",
};
