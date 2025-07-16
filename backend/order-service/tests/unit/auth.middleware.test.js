const { isAuthenticated, isAdmin } = require('../../middlewares/auth.middleware');
const jwt = require('jsonwebtoken');

describe('order-service auth.middleware', () => {
  describe('isAuthenticated', () => {
    it('should call next if token is valid', () => {
      const user = { id: 1, role: 'admin' };
      const token = jwt.sign(user, 'testsecret');
      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = {};
      const next = jest.fn();
      process.env.JWT_SECRET = 'testsecret';
      isAuthenticated(req, res, next);
      expect(req.user).toMatchObject(user);
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if no token', () => {
      const req = { headers: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      isAuthenticated(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Non autorisé' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
      const req = { headers: { authorization: 'Bearer invalidtoken' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      process.env.JWT_SECRET = 'testsecret';
      isAuthenticated(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Token invalide ou expiré' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('isAdmin', () => {
    it('should call next if user is admin', () => {
      const req = { user: { role: 'admin' } };
      const res = {};
      const next = jest.fn();
      isAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user is not admin', () => {
      const req = { user: { role: 'client' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      isAdmin(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ msg: "Accès réservé à l'admin" });
      expect(next).not.toHaveBeenCalled();
    });
  });
}); 