// Add tests here
// ===== 5. SCRIPT DE TEST MYSQL (test-mysql.js) =====
const mysql = require("mysql2/promise");

async function testMySQLConnection() {
  const configs = [
    // Configuration depuis .env
    {
      host: "localhost",
      port: 3308,
      user: "root",
      password: "root",
      database: "productdb",
    },
    // Configuration alternative
    {
      host: "127.0.0.1",
      port: 3308,
      user: "root",
      password: "root",
    },
  ];

  for (let i = 0; i < configs.length; i++) {
    try {
      console.log(`\n=== TEST CONFIG ${i + 1} ===`);
      console.log("Tentative de connexion:", configs[i]);

      const connection = await mysql.createConnection(configs[i]);
      console.log("✅ Connexion réussie!");

      // Tester une requête simple
      const [rows] = await connection.execute("SELECT 1 as test");
      console.log("✅ Requête test réussie:", rows);

      // Créer la base de données si elle n'existe pas
      if (!configs[i].database) {
        await connection.execute("CREATE DATABASE IF NOT EXISTS productdb");
        console.log("✅ Base de données productdb créée/vérifiée");
      }

      await connection.end();
      return true;
    } catch (error) {
      console.error(`❌ Config ${i + 1} échouée:`, error.message);
    }
  }

  return false;
}

// Lancer le test si ce fichier est exécuté directement
if (require.main === module) {
  testMySQLConnection()
    .then((success) => {
      if (success) {
        console.log("\n🎉 Au moins une configuration MySQL fonctionne!");
      } else {
        console.log("\n❌ Aucune configuration MySQL ne fonctionne");
        console.log("\n🔧 Solutions possibles:");
        console.log("1. Vérifiez que MySQL est démarré");
        console.log("2. Vérifiez le port (3308 ou 3306)");
        console.log("3. Vérifiez les identifiants");
        console.log("4. Essayez: mysql -u root -p -P 3308");
      }
    })
    .catch(console.error);
}
