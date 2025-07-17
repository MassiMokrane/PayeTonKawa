// Mock toutes les dépendances externes avant les imports
jest.mock('../rabbitmq', () => ({
  publishEvent: jest.fn(),
  connectAndListenRabbitMQ: jest.fn(),
  rabbitmqPublishCounter: { inc: jest.fn() },
  rabbitmqConsumeCounter: { inc: jest.fn() },
}));

jest.mock('../config/db', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(),
    query: jest.fn().mockResolvedValue(),
    define: jest.fn().mockReturnValue({
      sync: jest.fn().mockResolvedValue(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
    }),
  },
  connectDB: jest.fn().mockResolvedValue(),
}));

jest.mock('../models/user.model', () => ({
  User: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    sync: jest.fn().mockResolvedValue(),
  },
  initializeUserModel: jest.fn().mockResolvedValue(),
}));

const { register, login, getUsers, getUserById, updateUser, deleteUser } = require('../controllers/auth.controller');
const { isAuthenticated, isAdmin } = require('../middlewares/auth.middleware');
const { User } = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Service Unit Tests', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'testsecret';
    process.env.DB_HOST = 'localhost';
    process.env.DB_USER = 'root';
    process.env.DB_PASSWORD = 'test';
    process.env.DB_NAME = 'test_authdb';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper pour mocker les réponses
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  describe('Middleware Tests', () => {
    describe('isAuthenticated', () => {
      it('should call next if token is valid', () => {
        const user = { id: 1, role: 'admin' };
        const req = { headers: { authorization: 'Bearer validtoken' } };
        const res = {};
        const next = jest.fn();
        
        jwt.verify = jest.fn().mockReturnValue(user);
        
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
        
        jwt.verify = jest.fn().mockImplementation(() => {
          throw new Error('jwt malformed');
        });
        
        // Spy sur console.error pour éviter l'affichage dans les tests
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        isAuthenticated(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ msg: 'Token invalide' });
        expect(next).not.toHaveBeenCalled();
        
        consoleSpy.mockRestore();
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

  describe('Controller Tests', () => {
    describe('register', () => {
      it('crée un utilisateur si email non utilisé', async () => {
        User.findOne.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue('hashed');
        User.create.mockResolvedValue({ id: 1, nom: 'A', prenom: 'B', email: 'a@b.com', role: 'client' });
        
        const req = { body: { nom: 'A', prenom: 'B', email: 'a@b.com', password: 'pw' } };
        const res = mockRes();
        
        await register(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ msg: 'Utilisateur créé' });
      });

      it('refuse si email déjà utilisé', async () => {
        User.findOne.mockResolvedValue({ id: 1 });
        
        const req = { body: { email: 'a@b.com' } };
        const res = mockRes();
        
        await register(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ msg: 'Email déjà utilisé' });
      });

      it('gère une erreur serveur', async () => {
        User.findOne.mockRejectedValue(new Error('fail'));
        
        const req = { body: { email: 'a@b.com' } };
        const res = mockRes();
        
        // Spy sur console.error pour éviter l'affichage dans les tests
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        await register(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        
        consoleSpy.mockRestore();
      });
    });

    describe('login', () => {
      it('connecte un utilisateur avec bon mot de passe', async () => {
        User.findOne.mockResolvedValue({ id: 1, email: 'a@b.com', password: 'hashed', role: 'client' });
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('token');
        
        const req = { body: { email: 'a@b.com', password: 'pw' } };
        const res = mockRes();
        
        await login(req, res);
        expect(res.json).toHaveBeenCalledWith({ token: 'token', role: 'client', id: 1 });
      });

      it('refuse si utilisateur non trouvé', async () => {
        User.findOne.mockResolvedValue(null);
        
        const req = { body: { email: 'a@b.com', password: 'pw' } };
        const res = mockRes();
        
        await login(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
      });

      it('refuse si mauvais mot de passe', async () => {
        User.findOne.mockResolvedValue({ id: 1, password: 'hashed' });
        bcrypt.compare.mockResolvedValue(false);
        
        const req = { body: { email: 'a@b.com', password: 'pw' } };
        const res = mockRes();
        
        await login(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('gère une erreur serveur lors du login', async () => {
        User.findOne.mockRejectedValue(new Error('fail'));
        
        const req = { body: { email: 'a@b.com', password: 'pw' } };
        const res = mockRes();
        
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        await login(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        
        consoleSpy.mockRestore();
      });
    });

    describe('getUsers', () => {
      it('retourne la liste des utilisateurs', async () => {
        User.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
        
        const req = {};
        const res = mockRes();
        
        await getUsers(req, res);
        expect(res.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
      });

      it('gère une erreur serveur lors de getUsers', async () => {
        User.findAll.mockRejectedValue(new Error('fail'));
        
        const req = {};
        const res = mockRes();
        
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        await getUsers(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        
        consoleSpy.mockRestore();
      });
    });

    describe('getUserById', () => {
      it('retourne un utilisateur existant', async () => {
        User.findByPk.mockResolvedValue({ id: 1 });
        
        const req = { params: { id: 1 } };
        const res = mockRes();
        
        await getUserById(req, res);
        expect(res.json).toHaveBeenCalledWith({ id: 1 });
      });

      it('404 si utilisateur non trouvé', async () => {
        User.findByPk.mockResolvedValue(null);
        
        const req = { params: { id: 1 } };
        const res = mockRes();
        
        await getUserById(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
      });

      it('gère une erreur serveur lors de getUserById', async () => {
        User.findByPk.mockRejectedValue(new Error('fail'));
        
        const req = { params: { id: 1 } };
        const res = mockRes();
        
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        await getUserById(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        
        consoleSpy.mockRestore();
      });
    });

    describe('updateUser', () => {
      it('met à jour un utilisateur existant', async () => {
        User.update.mockResolvedValue([1]);
        User.findByPk.mockResolvedValue({ id: 1, nom: 'A' });
        
        const req = { params: { id: 1 }, body: { nom: 'A' } };
        const res = mockRes();
        
        await updateUser(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ id: 1, nom: 'A' });
      });

      it('404 si utilisateur non trouvé lors de la mise à jour', async () => {
        User.update.mockResolvedValue([0]);
        
        const req = { params: { id: 1 }, body: { nom: 'A' } };
        const res = mockRes();
        
        await updateUser(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
      });

      it('gère une erreur serveur lors de updateUser', async () => {
        User.update.mockRejectedValue(new Error('fail'));
        
        const req = { params: { id: 1 }, body: { nom: 'A' } };
        const res = mockRes();
        
        await updateUser(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('deleteUser', () => {
      it('supprime un utilisateur existant', async () => {
        User.destroy.mockResolvedValue(1);
        
        const req = { params: { id: 1 } };
        const res = mockRes();
        
        await deleteUser(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ msg: 'Utilisateur supprimé' });
      });

      it('404 si utilisateur non trouvé lors de la suppression', async () => {
        User.destroy.mockResolvedValue(0);
        
        const req = { params: { id: 1 } };
        const res = mockRes();
        
        await deleteUser(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
      });

      it('gère une erreur serveur lors de deleteUser', async () => {
        User.destroy.mockRejectedValue(new Error('fail'));
        
        const req = { params: { id: 1 } };
        const res = mockRes();
        
        await deleteUser(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });
  });

  describe('Model Tests', () => {
    it('crée un utilisateur avec les champs requis', async () => {
      User.create.mockResolvedValue({ 
        id: 1, 
        nom: 'A', 
        prenom: 'B', 
        email: 'a@b.com', 
        password: 'pw', 
        role: 'client' 
      });
      
      const user = await User.create({ nom: 'A', prenom: 'B', email: 'a@b.com', password: 'pw' });
      expect(user.id).toBeDefined();
      expect(user.role).toBe('client');
    });

    it('accepte le rôle admin', async () => {
      User.create.mockResolvedValue({ 
        id: 2, 
        nom: 'A', 
        prenom: 'B', 
        email: 'admin@b.com', 
        password: 'pw', 
        role: 'admin' 
      });
      
      const user = await User.create({ 
        nom: 'A', 
        prenom: 'B', 
        email: 'admin@b.com', 
        password: 'pw', 
        role: 'admin' 
      });
      expect(user.role).toBe('admin');
    });
  });
});
