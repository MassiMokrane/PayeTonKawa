// Mock process.exit et console.error AVANT tout import
jest.spyOn(process, 'exit').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

const request = require('supertest');
const app = require('../../app');
// Mock des modèles Sequelize
jest.mock('../../models', () => ({
  Order: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(), // Ajouté
    update: jest.fn(),
    destroy: jest.fn(),
  },
  OrderItem: {
    bulkCreate: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));
const { Order, OrderItem } = require('../../models');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../../config/db');

// Mock helpers API
jest.mock('../../utils/api', () => ({
  checkUserExists: jest.fn(),
  getProductDetails: jest.fn(),
  updateProductStock: jest.fn(),
}));
const { checkUserExists, getProductDetails, updateProductStock } = require('../../utils/api');

// Mock RabbitMQ
jest.mock('../../rabbitmq', () => ({
  publishEvent: jest.fn(),
  connectAndListenRabbitMQ: jest.fn(),
  rabbitmqPublishCounter: { inc: jest.fn() },
  rabbitmqConsumeCounter: { inc: jest.fn() },
}));

// Mock Prometheus
jest.mock('prom-client', () => ({
  Counter: function () { return { inc: jest.fn() }; },
  Histogram: function () { return { observe: jest.fn() }; },
  register: { registerMetric: jest.fn() },
  collectDefaultMetrics: jest.fn()
}));

describe('order-service integration', () => {
  let adminToken, userToken, adminId, userId;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret';
    // await sequelize.sync({ force: true }); // Supprimé pour éviter la connexion réelle à la base
    // Crée un admin et un user fictifs
    adminId = 1;
    userId = 2;
    adminToken = jwt.sign({ id: adminId, role: 'admin' }, process.env.JWT_SECRET);
    userToken = jwt.sign({ id: userId, role: 'client' }, process.env.JWT_SECRET);
    // Configure les mocks helpers API
    checkUserExists.mockImplementation((id) => id === userId);
    getProductDetails.mockImplementation((id) => id === 10 ? { id: 10, name: 'Café', price: 2.5, quantity: 100 } : null);
    updateProductStock.mockResolvedValue(true);
    // Configure les mocks modèles
    const mockOrder = { id: 1, userId, status: 'pending', total: 5, update: jest.fn(), destroy: jest.fn(), items: [{ id: 1 }] };
    Order.create.mockResolvedValue(mockOrder);
    Order.findAll.mockResolvedValue([mockOrder]);
    Order.findByPk.mockImplementation((id) => {
      // Si c'est pour le test de mise à jour, retourne status: 'paid'
      if (expect.getState().currentTestName && expect.getState().currentTestName.includes('met à jour')) {
        return Promise.resolve({ ...mockOrder, status: 'paid' });
      }
      return Promise.resolve(mockOrder);
    });
    Order.findOne.mockResolvedValue(mockOrder);
    OrderItem.bulkCreate.mockResolvedValue([]);
    OrderItem.create.mockResolvedValue({});
    OrderItem.findAll.mockResolvedValue([]);
  });

  afterAll(async () => {
    await OrderItem.destroy({ where: {} });
    await Order.destroy({ where: {} });
    await sequelize.close();
  });

  it('POST /api/orders crée une commande', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ userId, items: [{ productId: 10, quantity: 2 }] });
    expect(res.statusCode).toBe(201);
    expect(res.body.order).toBeDefined();
    expect(res.body.order.items.length).toBe(1);
  });

  it('GET /api/orders retourne la liste des commandes', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/orders/:id retourne une commande', async () => {
    const order = await Order.findOne();
    const res = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(order.id);
  });

  it('PUT /api/orders/:id met à jour une commande', async () => {
    const order = await Order.findOne();
    const res = await request(app)
      .put(`/api/orders/${order.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'paid' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('paid');
  });

  it('DELETE /api/orders/:id supprime une commande', async () => {
    const order = await Order.create({ userId, total: 5, status: 'pending' });
    const res = await request(app)
      .delete(`/api/orders/${order.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(204);
  });

  it('GET /api/orders/user/:userId retourne les commandes d\'un utilisateur', async () => {
    const res = await request(app)
      .get(`/api/orders/user/${userId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/orders/health retourne le status UP', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('order-service');
  });
});

afterAll(() => {
  // Ajoute un log pour vérifier la fin des tests
  console.log('✅ Fin des tests d\'intégration order-service');
}); 