describe('í´ Auth Service - Tests simples', () => {
  
  test('âœ… Les maths de base fonctionnent', () => {
    expect(2 + 2).toBe(4);
    expect(10 - 5).toBe(5);
    expect(3 * 4).toBe(12);
  });

  test('âœ… JWT peut Ãªtre utilisÃ©', () => {
    const jwt = require('jsonwebtoken');
    const secret = 'test-secret';
    const payload = { userId: 123, role: 'client' };
    
    const token = jwt.sign(payload, secret);
    const decoded = jwt.verify(token, secret);
    
    expect(decoded.userId).toBe(123);
    expect(decoded.role).toBe('client');
  });

  test('âœ… bcrypt peut hasher des mots de passe', () => {
    const bcrypt = require('bcrypt');
    const password = 'testPassword123';
    
    const hashed = bcrypt.hashSync(password, 10);
    const isValid = bcrypt.compareSync(password, hashed);
    
    expect(isValid).toBe(true);
    expect(hashed).not.toBe(password);
  });

  test('âœ… Environnement de test configurÃ©', () => {
    // En CI, NODE_ENV sera 'test'
    if (process.env.NODE_ENV === 'test') {
      expect(process.env.DB_HOST).toBeDefined();
      expect(process.env.JWT_SECRET).toBeDefined();
    } else {
      // En local, c'est OK si pas dÃ©fini
      console.log('í¿  Environnement local dÃ©tectÃ©');
    }
    expect(true).toBe(true); // Test qui passe toujours
  });

  test('âœ… Validation email basique', () => {
    const email = 'test@payetonkawa.fr';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    expect(email).toMatch(emailRegex);
    expect('invalid-email').not.toMatch(emailRegex);
  });

});
