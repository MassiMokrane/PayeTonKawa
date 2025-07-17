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
    close: jest.fn().mockResolvedValue(),
  },
  connectDB: jest.fn().mockResolvedValue(),
}));

jest.mock('../models', () => ({
  Order: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    sync: jest.fn().mockResolvedValue(),
  },
  OrderItem: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    bulkCreate: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    sync: jest.fn().mockResolvedValue(),
  },
  initializeModels: jest.fn().mockResolvedValue(),
}));

jest.mock('../utils/api', () => ({
  getProductDetails: jest.fn(),
  updateProductStock: jest.fn(),
  checkUserExists: jest.fn(),
  publishToQueue: jest.fn(),
}));

const { createOrder, getOrders, getOrderById, updateOrder, deleteOrder, getOrdersByUserId } = require('../controllers/order.controller');
const { isAuthenticated, isAdmin } = require('../middlewares/auth.middleware');
const { Order, OrderItem } = require('../models');
const { getProductDetails, updateProductStock, checkUserExists } = require('../utils/api');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Order Service Unit Tests', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'testsecret';
    process.env.DB_HOST = 'localhost';
    process.env.DB_USER = 'root';
    process.env.DB_PASSWORD = 'test';
    process.env.DB_NAME = 'test_orderdb';
    process.env.DB_PORT = '3309';
    process.env.PORT = '5002';
    process.env.PRODUCT_SERVICE_URL = 'http://localhost:5001';
    process.env.AUTH_SERVICE_URL = 'http://localhost:5000';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper pour mocker les réponses
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
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
        
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        
        isAuthenticated(req, res, next);
        expect(req.user).toMatchObject(user);
        expect(next).toHaveBeenCalled();
        
        consoleSpy.mockRestore();
      });

      it('should return 401 if no token', () => {
        const req = { headers: {} };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        
        isAuthenticated(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ msg: 'Non autorisé' });
        expect(next).not.toHaveBeenCalled();
        
        consoleSpy.mockRestore();
      });

      it('should return 401 if token is invalid', () => {
        const req = { headers: { authorization: 'Bearer invalidtoken' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        
        jwt.verify = jest.fn().mockImplementation(() => {
          throw new Error('jwt malformed');
        });
        
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        
        isAuthenticated(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ msg: 'Token invalide ou expiré' });
        expect(next).not.toHaveBeenCalled();
        
        consoleSpy.mockRestore();
        logSpy.mockRestore();
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
    describe('createOrder', () => {
      it('crée une commande avec succès', async () => {
        const mockOrder = { id: 1, userId: 1, total: 5, status: 'pending' };
        getProductDetails.mockResolvedValue({ id: 1, name: 'Café', price: 2.5, quantity: 100 });
        updateProductStock.mockResolvedValue(true);
        Order.create.mockResolvedValue(mockOrder);
        OrderItem.bulkCreate.mockResolvedValue([]);
        Order.findByPk.mockResolvedValue({
          ...mockOrder,
          items: [{ id: 1, productId: 1, quantity: 2, unitPrice: 2.5, totalPrice: 5 }]
        });
        
        const req = { 
          body: { 
            userId: 1, 
            items: [{ productId: 1, quantity: 2 }] 
          } 
        };
        const res = mockRes();
        
        await createOrder(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          message: 'Commande créée avec succès'
        }));
      });

      it('refuse une commande avec liste d\'items vide', async () => {
        const req = { body: { userId: 1, items: [] } };
        const res = mockRes();
        
        await createOrder(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "La liste des produits est vide ou invalide"
        });
      });

      it('refuse une commande si produit non trouvé', async () => {
        getProductDetails.mockResolvedValue(null);
        
        const req = { 
          body: { 
            userId: 1, 
            items: [{ productId: 999, quantity: 1 }] 
          } 
        };
        const res = mockRes();
        
        await createOrder(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Produit 999 introuvable"
        });
      });

      it('refuse une commande si stock insuffisant', async () => {
        getProductDetails.mockResolvedValue({ id: 1, name: 'Café', price: 2.5, quantity: 1 });
        
        const req = { 
          body: { 
            userId: 1, 
            items: [{ productId: 1, quantity: 5 }] 
          } 
        };
        const res = mockRes();
        
        await createOrder(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Stock insuffisant pour le produit 1. Stock disponible: 1, demandé: 5"
        });
      });

      it('gère une erreur serveur', async () => {
        getProductDetails.mockRejectedValue(new Error('Service indisponible'));
        
        const req = { 
          body: { 
            userId: 1, 
            items: [{ productId: 1, quantity: 1 }] 
          } 
        };
        const res = mockRes();
        
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        await createOrder(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        
        consoleSpy.mockRestore();
      });
    });

    describe('getOrders', () => {
      it('retourne la liste des commandes', async () => {
        const mockOrders = [
          { id: 1, userId: 1, total: 5, items: [] },
          { id: 2, userId: 2, total: 10, items: [] }
        ];
        Order.findAll.mockResolvedValue(mockOrders);
        
        const req = {};
        const res = mockRes();
        
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        
        await getOrders(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockOrders);
        
        consoleSpy.mockRestore();
      });

      it('gère une erreur serveur lors de getOrders', async () => {
        Order.findAll.mockRejectedValue(new Error('Database error'));
        
        const req = {};
        const res = mockRes();
        
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        
        await getOrders(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        
        consoleSpy.mockRestore();
        logSpy.mockRestore();
      });
    });

    describe('getOrderById', () => {
      it('retourne une commande existante', async () => {
        const mockOrder = { id: 1, userId: 1, total: 5, items: [] };
        Order.findByPk.mockResolvedValue(mockOrder);
        
        const req = { params: { id: 1 } };
        const res = mockRes();
        
        await getOrderById(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockOrder);
      });

      it('404 si commande non trouvée', async () => {
        Order.findByPk.mockResolvedValue(null);
        
        const req = { params: { id: 999 } };
        const res = mockRes();
        
        await getOrderById(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Commande non trouvée" });
      });

      it('gère une erreur serveur lors de getOrderById', async () => {
        Order.findByPk.mockRejectedValue(new Error('Database error'));
        
        const req = { params: { id: 1 } };
        const res = mockRes();
        
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        await getOrderById(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        
        consoleSpy.mockRestore();
      });
    });

    describe('updateOrder', () => {
      it('met à jour une commande existante', async () => {
        const mockOrder = { 
          id: 1, 
          userId: 1, 
          total: 5, 
          status: 'pending',
          update: jest.fn().mockResolvedValue()
        };
        const updatedOrder = { ...mockOrder, status: 'completed' };
        
        Order.findByPk.mockResolvedValueOnce(mockOrder);
        Order.findByPk.mockResolvedValueOnce(updatedOrder);
        
        const req = { 
          params: { id: 1 }, 
          body: { status: 'completed' } 
        };
        const res = mockRes();
        
        await updateOrder(req, res);
        expect(mockOrder.update).toHaveBeenCalledWith({ status: 'completed' });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(updatedOrder);
      });

      it('404 si commande non trouvée lors de la mise à jour', async () => {
        Order.findByPk.mockResolvedValue(null);
        
        const req = { 
          params: { id: 999 }, 
          body: { status: 'completed' } 
        };
        const res = mockRes();
        
        await updateOrder(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Commande non trouvée" });
      });

      it('gère une erreur serveur lors de updateOrder', async () => {
        Order.findByPk.mockRejectedValue(new Error('Database error'));
        
        const req = { 
          params: { id: 1 }, 
          body: { status: 'completed' } 
        };
        const res = mockRes();
        
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        await updateOrder(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        
        consoleSpy.mockRestore();
      });
    });

    describe('deleteOrder', () => {
      it('supprime une commande existante', async () => {
        const mockOrder = { 
          id: 1, 
          userId: 1, 
          items: [{ productId: 1, quantity: 2 }],
          destroy: jest.fn().mockResolvedValue()
        };
        Order.findByPk.mockResolvedValue(mockOrder);
        
        const req = { params: { id: 1 } };
        const res = mockRes();
        
        await deleteOrder(req, res);
        expect(mockOrder.destroy).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(204);
      });

      it('404 si commande non trouvée lors de la suppression', async () => {
        Order.findByPk.mockResolvedValue(null);
        
        const req = { params: { id: 999 } };
        const res = mockRes();
        
        await deleteOrder(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Commande non trouvée" });
      });

      it('gère une erreur serveur lors de deleteOrder', async () => {
        Order.findByPk.mockRejectedValue(new Error('Database error'));
        
        const req = { params: { id: 1 } };
        const res = mockRes();
        
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        await deleteOrder(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        
        consoleSpy.mockRestore();
      });
    });

    describe('getOrdersByUserId', () => {
      it('retourne les commandes d\'un utilisateur', async () => {
        const mockOrders = [
          { id: 1, userId: 1, total: 5, items: [] }
        ];
        Order.findAll.mockResolvedValue(mockOrders);
        
        const req = { params: { userId: 1 } };
        const res = mockRes();
        
        await getOrdersByUserId(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockOrders);
      });

      it('gère une erreur serveur lors de getOrdersByUserId', async () => {
        Order.findAll.mockRejectedValue(new Error('Database error'));
        
        const req = { params: { userId: 1 } };
        const res = mockRes();
        
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        await getOrdersByUserId(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        
        consoleSpy.mockRestore();
      });
    });
  });

  describe('Model Tests', () => {
    it('crée une commande avec les champs requis', async () => {
      Order.create.mockResolvedValue({ 
        id: 1, 
        userId: 1, 
        total: 25.50,
        status: 'pending'
      });
      
      const order = await Order.create({ userId: 1, total: 25.50, status: 'pending' });
      expect(order.id).toBeDefined();
      expect(order.userId).toBe(1);
      expect(order.total).toBe(25.50);
      expect(order.status).toBe('pending');
    });

    it('crée des items de commande', async () => {
      OrderItem.bulkCreate.mockResolvedValue([
        { id: 1, orderId: 1, productId: 1, quantity: 2, unitPrice: 2.5, totalPrice: 5 }
      ]);
      
      const items = await OrderItem.bulkCreate([
        { orderId: 1, productId: 1, quantity: 2, unitPrice: 2.5, totalPrice: 5 }
      ]);
      expect(items).toHaveLength(1);
      expect(items[0].orderId).toBe(1);
      expect(items[0].productId).toBe(1);
    });
  });
});
