#!/bin/bash
echo "🚀 Démarrage du Order Service..."

# Vérifier si le fichier .env existe
if [ ! -f .env ]; then
    echo "❌ Fichier .env manquant!"
    exit 1
fi

# Installer les dépendances
npm install

# Démarrer le service
npm start
