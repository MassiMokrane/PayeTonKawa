// Mock RabbitMQ avant tous les imports
jest.mock('../rabbitmq', () => ({
  publishEvent: jest.fn(),
  connectAndListenRabbitMQ: jest.fn(),
  rabbitmqPublishCounter: { inc: jest.fn() },
  rabbitmqConsumeCounter: { inc: jest.fn() },
}));

// Mock Sequelize complet pour les tests d'intégration
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

// Mock du modèle User complet
jest.mock('../models/user.model', () => ({
  User: {
    sync: jest.fn().mockResolvedValue(),
    findOne: jest.fn().mockResolvedValue(null),
    findAll: jest.fn().mockResolvedValue([]),
    findByPk: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: 1, email: 'test@test.com' }),
    update: jest.fn().mockResolvedValue([1]),
    destroy: jest.fn().mockResolvedValue(1),
  },
  initializeUserModel: jest.fn().mockResolvedValue(),
}));

// Mock bcrypt pour éviter les erreurs dans les tests d'intégration
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

const request = require('supertest');

describe('Auth Service Integration Tests', () => {
  let app;
  
  beforeAll(() => {
    // Variables d'environnement pour les tests
    process.env.JWT_SECRET = 'testsecret';
    process.env.DB_HOST = 'localhost';
    process.env.DB_USER = 'root';
    process.env.DB_PASSWORD = 'test';
    process.env.DB_NAME = 'test_authdb';
    process.env.PORT = '5000';
    
    // Spy sur console.error pour éviter l'affichage des erreurs attendues
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Charger l'app après avoir défini les mocks
    app = require('../app');
  });

  afterAll(() => {
    // Restaurer console.error
    console.error.mockRestore();
  });

  describe('Health Check Endpoints', () => {
    it('GET /health retourne le status UP', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('UP');
      expect(res.body.service).toBe('auth-service');
      expect(res.body.timestamp).toBeDefined();
    });

    it('GET /api/auth/health retourne le status UP', async () => {
      const res = await request(app).get('/api/auth/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('UP');
      expect(res.body.service).toBe('auth-service');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('Metrics Endpoint', () => {
    it('GET /metrics retourne les métriques Prometheus', async () => {
      const res = await request(app).get('/metrics');
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/plain');
      expect(res.text).toContain('# HELP');
    });
  });

  describe('CORS and Security', () => {
    it('should have CORS headers', async () => {
      const res = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:3000');
      
      // CORS peut retourner 200 ou 204 selon la configuration
      expect([200, 204]).toContain(res.statusCode);
    });

    it('should have security headers from Helmet', async () => {
      const res = await request(app).get('/health');
      
      // Vérifier que Helmet ajoute des headers de sécurité
      expect(res.headers).toHaveProperty('x-dns-prefetch-control');
      expect(res.headers).toHaveProperty('x-frame-options');
      expect(res.headers).toHaveProperty('x-download-options');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 routes', async () => {
      const res = await request(app).get('/route-inexistante');
      expect(res.statusCode).toBe(404);
    });

    it('should handle malformed JSON gracefully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('{"malformed": json}');
      
      // Express gère automatiquement les JSON malformés avec un 400 ou 500
      expect([400, 500]).toContain(res.statusCode);
    });
  });

  describe('Authentication Protection', () => {
    it('GET /api/auth/users route needs authentication', async () => {
      const res = await request(app)
        .get('/api/auth/users');
      
      // Doit retourner 401 (non autorisé) car pas de token
      expect(res.statusCode).toBe(401);
    });

    it('should handle protected routes without token', async () => {
      const res = await request(app).get('/api/auth/profile');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('Basic Route Functionality', () => {
    it('application should start without errors', async () => {
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
    });

    it('should respond to basic requests', async () => {
      const res = await request(app).get('/health');
      expect(res).toBeDefined();
      expect(res.statusCode).toBeDefined();
    });
  });
});
