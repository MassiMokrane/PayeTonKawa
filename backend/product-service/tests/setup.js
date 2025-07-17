// Setup global pour les tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test_productdb';
process.env.DB_PORT = '3306';
process.env.PORT = '5001';

// Supprimer les logs console pendant les tests
if (process.env.NODE_ENV === 'test') {
  const originalLog = console.log;
  console.log = (...args) => {
    // Garder seulement les logs de test importants
    if (args[0] && typeof args[0] === 'string' && 
        (args[0].includes('✅') || args[0].includes('❌') || args[0].includes('Test'))) {
      originalLog.apply(console, args);
    }
  };
}
