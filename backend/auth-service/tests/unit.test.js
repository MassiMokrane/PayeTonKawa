const { validateEmail, hashPassword, generateJWT } = require('../utils');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('Tests unitaires des utilitaires', () => {
  describe('validateEmail', () => {
    it('retourne true pour un email correct', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co')).toBe(true);
    });
    it('retourne false pour un email incorrect', () => {
      expect(validateEmail('testexample.com')).toBe(false);
      expect(validateEmail('test@.com')).toBe(false);
      expect(validateEmail('test@com')).toBe(false);
    });
  });

  describe('hashPassword', () => {
    it('génère un hash différent du mot de passe d\'origine', async () => {
      const password = 'mypassword123';
      const hash = await hashPassword(password);
      expect(hash).not.toBe(password);
      // Vérifie que le hash correspond au mot de passe original
      const match = await bcrypt.compare(password, hash);
      expect(match).toBe(true);
    });
  });

  describe('generateJWT', () => {
    it('génère un token contenant les bons champs', () => {
      const payload = { id: 1, role: 'client' };
      const secret = 'testsecret';
      const token = generateJWT(payload, secret, { expiresIn: '1h' });
      // Décoder le token pour vérifier le payload
      const decoded = jwt.verify(token, secret);
      expect(decoded.id).toBe(1);
      expect(decoded.role).toBe('client');
      expect(decoded.exp).toBeDefined();
    });
  });
}); 