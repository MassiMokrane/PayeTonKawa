// Configuration globale pour les tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'root';
process.env.DB_NAME = 'test_db';
process.env.RABBITMQ_URL = 'amqp://localhost:5672';

// Mock console.error pour éviter le bruit dans les tests
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is deprecated')
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Mock process.exit pour éviter que les tests arrêtent le processus
const originalExit = process.exit;
process.exit = (code) => {
  if (process.env.NODE_ENV === 'test') {
    throw new Error(`Process.exit(${code}) called during test`);
  }
  originalExit(code);
};

// Configuration globale de timeout pour les tests
jest.setTimeout(10000);

// Nettoyage après chaque test
afterEach(() => {
  jest.clearAllMocks();
}); 