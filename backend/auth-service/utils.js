const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Validation d'email simple (regex)
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Hash du mot de passe
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Génération d'un token JWT
function generateJWT(payload, secret, options = { expiresIn: '1d' }) {
  return jwt.sign(payload, secret, options);
}

module.exports = {
  validateEmail,
  hashPassword,
  generateJWT,
}; 