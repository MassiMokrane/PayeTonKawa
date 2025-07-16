// Définir les variables d'environnement AVANT d'importer les modules
process.env.JWT_SECRET = 'testsecret';
process.env.DB_NAME = 'orderdb';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'root';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';
process.env.PRODUCT_SERVICE_URL = 'http://product-service:5001';
process.env.AUTH_SERVICE_URL = 'http://auth-service:5000';

const request = require('supertest');
const app = require('../../app');
const jwt = require('jsonwebtoken');

// Mock des modèles pour éviter les problèmes de base de données
jest.mock('../../models', () => ({
  Order: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    sync: jest.fn()
  },
  OrderItem: {
    create: jest.fn(),
    destroy: jest.fn(),
    sync: jest.fn()
  },
  initializeModels: jest.fn()
}));

// Mock des appels HTTP externes pour éviter les dépendances
jest.mock('../../utils/api', () => ({
  checkUserExists: jest.fn().mockResolvedValue(true),
  getProductDetails: jest.fn().mockResolvedValue({
    id: 1,
    name: 'Test Product',
    price: 10.50,
    stock: 100
  }),
  updateProductStock: jest.fn().mockResolvedValue(true)
}));

describe('order-service integration', () => {
  let userToken, adminToken, userId;
  const { Order, OrderItem, initializeModels } = require('../../models');

  beforeAll(async () => {
    // Créer un utilisateur de test
    userId = 1;
    userToken = jwt.sign({ id: userId, role: 'client' }, process.env.JWT_SECRET);
    adminToken = jwt.sign({ id: 999, role: 'admin' }, process.env.JWT_SECRET);
  });

  beforeEach(() => {
    // Reset des mocks avant chaque test
    jest.clearAllMocks();
  });

  describe('POST /api/orders', () => {
    it('crée une commande avec des items', async () => {
      // Mock de la création d'ordre
      const mockOrder = {
        id: 1,
        userId: userId,
        total: 21.00,
        status: 'pending',
        items: [{ productId: 1, quantity: 2, unitPrice: 10.50 }]
      };
      Order.create.mockResolvedValue(mockOrder);

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          userId: userId,
          items: [
            { productId: 1, quantity: 2, unitPrice: 10.50 }
          ]
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.order).toBeDefined();
      expect(res.body.order.userId).toBe(userId);
      expect(res.body.order.items).toHaveLength(1);
      expect(res.body.order.total).toBe(21.00); // 2 * 10.50
    });

    it('calcule correctement le total avec plusieurs items', async () => {
      // Mock de la création d'ordre
      const mockOrder = {
        id: 1,
        userId: userId,
        total: 20.00,
        status: 'pending',
        items: [
          { productId: 1, quantity: 1, unitPrice: 10.50 },
          { productId: 2, quantity: 2, unitPrice: 5.25 }
        ]
      };
      Order.create.mockResolvedValue(mockOrder);

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          userId: userId,
          items: [
            { productId: 1, quantity: 1, unitPrice: 10.50 },
            { productId: 2, quantity: 2, unitPrice: 5.25 }
          ]
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.order.total).toBe(20.00); // 10.50 + (2 * 5.25)
      expect(res.body.order.items).toHaveLength(2);
    });

    it('échoue sans token d\'authentification', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          userId: userId,
          items: [{ productId: 1, quantity: 1, unitPrice: 10.50 }]
        });

      expect(res.statusCode).toBe(401);
    });

    it('échoue avec des données invalides', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          userId: userId,
          items: [] // Items vides
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/orders', () => {
    beforeEach(() => {
      // Mock des commandes de test
      const mockOrders = [
        {
          id: 1,
          userId: userId,
          total: 21.00,
          status: 'pending',
          items: [{ orderId: 1, productId: 1, quantity: 2, unitPrice: 10.50 }]
        },
        {
          id: 2,
          userId: userId,
          total: 15.75,
          status: 'completed',
          items: [{ orderId: 2, productId: 2, quantity: 3, unitPrice: 5.25 }]
        }
      ];
      Order.findAll.mockResolvedValue(mockOrders);
    });

    it('retourne toutes les commandes pour un admin', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('retourne seulement les commandes de l\'utilisateur connecté', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
      // Vérifier que toutes les commandes appartiennent à l'utilisateur
      res.body.forEach(order => {
        expect(order.userId).toBe(userId);
      });
    });

    it('échoue sans token d\'authentification', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/orders/:id', () => {
    let orderId;

    beforeEach(() => {
      orderId = 1;
      const mockOrder = {
        id: orderId,
        userId: userId,
        total: 21.00,
        status: 'pending',
        items: [{ orderId: orderId, productId: 1, quantity: 2, unitPrice: 10.50 }]
      };
      Order.findByPk.mockResolvedValue(mockOrder);
    });

    it('retourne une commande spécifique', async () => {
      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(orderId);
      expect(res.body.userId).toBe(userId);
      expect(res.body.items).toHaveLength(1);
    });

    it('retourne 404 pour une commande inexistante', async () => {
      const res = await request(app)
        .get('/api/orders/99999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(404);
    });

    it('échoue sans token d\'authentification', async () => {
      const res = await request(app).get(`/api/orders/${orderId}`);
      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/orders/:id/status', () => {
    let orderId;

    beforeEach(() => {
      orderId = 1;
      const mockOrder = {
        id: orderId,
        userId: userId,
        total: 21.00,
        status: 'pending'
      };
      Order.findByPk.mockResolvedValue(mockOrder);
      Order.update.mockResolvedValue([1]); // 1 ligne mise à jour
    });

    it('met à jour le statut d\'une commande', async () => {
      const res = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'completed' });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('completed');
    });

    it('échoue avec un statut invalide', async () => {
      const res = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid_status' });

      expect(res.statusCode).toBe(400);
    });

    it('échoue sans droits admin', async () => {
      const res = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'completed' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('Health endpoint', () => {
    it('GET /api/orders/health retourne le status UP', async () => {
      const res = await request(app).get('/api/orders/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('UP');
      expect(res.body.service).toBe('order-service');
    });
  });
}); 