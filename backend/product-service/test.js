const fs = require("fs");
const path = require("path");

// Test du dossier uploads
const uploadDir = path.join(__dirname, "uploads");
console.log("📁 Dossier uploads:", uploadDir);
console.log("📁 Dossier absolu:", path.resolve(uploadDir));

// Vérifier si le dossier existe
if (fs.existsSync(uploadDir)) {
  console.log("✅ Dossier existe");

  // Lister les fichiers
  const files = fs.readdirSync(uploadDir);
  console.log("📄 Fichiers présents:", files.length);

  files.forEach((file, index) => {
    const filePath = path.join(uploadDir, file);
    const stats = fs.statSync(filePath);
    console.log(`${index + 1}. ${file} (${stats.size} bytes) - ${stats.mtime}`);
  });

  // Créer un fichier de test
  const testFile = path.join(uploadDir, "test.txt");
  fs.writeFileSync(testFile, "Test de création de fichier");
  console.log("✅ Fichier de test créé");

  // Supprimer le fichier de test
  fs.unlinkSync(testFile);
  console.log("🗑️ Fichier de test supprimé");
} else {
  console.log("❌ Dossier n'existe pas");
}

// Tester les permissions
try {
  fs.accessSync(uploadDir, fs.constants.W_OK);
  console.log("✅ Permissions d'écriture OK");
} catch (error) {
  console.error("❌ Problème de permissions:", error.message);
}
