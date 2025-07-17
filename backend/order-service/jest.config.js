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

module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middlewares/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  testTimeout: 10000,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  // Éviter les warnings sur les handles ouverts
  maxWorkers: 1,
  // Forcer la fermeture après chaque test
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
