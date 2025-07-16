const request = require('supertest');
const app = require('../../app');
const { Product, initializeProductModel } = require('../../models/product.model');
const jwt = require('jsonwebtoken');

jest.mock('prom-client', () => {
  const Counter = function () { return { inc: jest.fn() }; };
  const Histogram = function () { return { observe: jest.fn() }; };
  return {
    Counter,
    Histogram,
    register: { registerMetric: jest.fn() },
    collectDefaultMetrics: jest.fn()
  };
});

jest.mock('../../rabbitmq', () => ({
  publishEvent: jest.fn(),
  connectAndListenRabbitMQ: jest.fn(),
  rabbitmqPublishCounter: { inc: jest.fn() },
  rabbitmqConsumeCounter: { inc: jest.fn() },
}));

jest.mock('../../middlewares/upload', () => ({
  single: () => (req, res, next) => next()
}));

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterAll(() => {
  console.log.mockRestore();
});

describe('product-service integration', () => {
  let adminToken, userToken, adminId, userId;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret';
    await initializeProductModel();
    await Product.destroy({ where: {} });
    adminId = 1;
    userId = 2;
    adminToken = jwt.sign({ id: adminId, role: 'admin' }, process.env.JWT_SECRET);
    userToken = jwt.sign({ id: userId, role: 'client' }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await Product.destroy({ where: {} });
  });

  it('POST /api/products crée un produit (admin)', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Café', price: 2.5, quantity: 100 });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Café');
  });

  it('GET /api/products retourne la liste des produits', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/products/:id retourne un produit', async () => {
    const prod = await Product.create({ name: 'Test', price: 1, quantity: 10 });
    const res = await request(app).get(`/api/products/${prod.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(prod.id);
  });

  it('PUT /api/products/:id modifie un produit (admin)', async () => {
    const prod = await Product.create({ name: 'ToUpdate', price: 1, quantity: 10 });
    const res = await request(app)
      .put(`/api/products/${prod.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Café modifié' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Café modifié');
  });

  it('DELETE /api/products/:id supprime un produit', async () => {
    const prod = await Product.create({ name: 'Test', price: 1, quantity: 10 });
    const res = await request(app)
      .delete(`/api/products/${prod.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });

  // Nouveaux tests pour l'endpoint de mise à jour du stock
  it('PUT /api/products/:id/stock met à jour le stock d\'un produit', async () => {
    const prod = await Product.create({ name: 'Test Stock', price: 5.50, quantity: 100 });
    
    const res = await request(app)
      .put(`/api/products/${prod.id}/stock`)
      .send({ quantity: 50 });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Stock mis à jour avec succès');
    expect(res.body.product.quantity).toBe(50);
    expect(res.body.product.name).toBe('Test Stock');
  });

  it('PUT /api/products/:id/stock échoue avec une quantité négative', async () => {
    const prod = await Product.create({ name: 'Test Stock', price: 5.50, quantity: 100 });
    
    const res = await request(app)
      .put(`/api/products/${prod.id}/stock`)
      .send({ quantity: -10 });
    
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Quantité invalide');
  });

  it('PUT /api/products/:id/stock échoue si le produit n\'existe pas', async () => {
    const res = await request(app)
      .put('/api/products/999/stock')
      .send({ quantity: 50 });
    
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Produit non trouvé');
  });

  it('PUT /api/products/:id/stock échoue sans quantité', async () => {
    const prod = await Product.create({ name: 'Test Stock', price: 5.50, quantity: 100 });
    
    const res = await request(app)
      .put(`/api/products/${prod.id}/stock`)
      .send({});
    
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Quantité invalide');
  });

  it('GET /api/products/health retourne le status UP', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('product-service');
  });
}); 