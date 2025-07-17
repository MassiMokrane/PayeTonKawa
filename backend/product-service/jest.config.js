process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test_productdb';
process.env.DB_PORT = '3306';
process.env.PORT = '5001';

module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middlewares/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
