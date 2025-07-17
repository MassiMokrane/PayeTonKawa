// Setup global pour les tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test_orderdb';
process.env.DB_PORT = '3309';
process.env.PORT = '5002';
process.env.PRODUCT_SERVICE_URL = 'http://localhost:5001';
process.env.AUTH_SERVICE_URL = 'http://localhost:5000';
process.env.RABBITMQ_URL = 'amqp://admin:password@localhost:5672';

// Supprimer TOUS les logs console pendant les tests
if (process.env.NODE_ENV === 'test') {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
  console.info = jest.fn();
}

// Nettoyer après chaque test
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});
