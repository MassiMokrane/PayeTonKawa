const { validateEmail, hashPassword, generateJWT } = require('./utils');

(async () => {
  // Test de validateEmail
  console.log('Email valide (test@example.com) ?', validateEmail('test@example.com')); // true
  console.log('Email valide (testexample.com) ?', validateEmail('testexample.com'));   // false

  // Test de hashPassword
  const password = 'mypassword123';
  const hash = await hashPassword(password);
  console.log('Hash généré:', hash);
  console.log('Hash différent du mot d\'origine ?', hash !== password); // true

  // Test de generateJWT
  const token = generateJWT({ id: 1, role: 'client' }, 'testsecret');
  console.log('Token JWT généré:', token);
})(); 