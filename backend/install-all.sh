#!/bin/sh

echo "Installation des dépendances pour order-service..."
cd order-service && npm install && cd ..

echo "Installation des dépendances pour product-service..."
cd product-service && npm install && cd ..

echo "Installation des dépendances pour auth-service..."
cd auth-service && npm install && cd ..

echo "✅ Toutes les dépendances sont installées !" 