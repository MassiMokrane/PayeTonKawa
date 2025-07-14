#!/bin/bash

echo "🔄 Redémarrage des services avec les nouvelles fonctionnalités RabbitMQ..."

# Arrêter les services
echo "⏹️  Arrêt des services..."
docker-compose down

# Reconstruire les images avec les nouvelles dépendances
echo "🔨 Reconstruction des images..."
docker-compose build --no-cache

# Redémarrer les services
echo "▶️  Démarrage des services..."
docker-compose up -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 30

# Vérifier le statut des services
echo "📊 Statut des services:"
docker-compose ps

echo "✅ Services redémarrés avec succès!"
echo ""
echo "🔗 URLs des services:"
echo "  - Auth Service: http://localhost:5000"
echo "  - Product Service: http://localhost:5001"
echo "  - Order Service: http://localhost:5002"
echo "  - RabbitMQ Management: http://localhost:15672 (admin/password)"
echo "  - Grafana: http://localhost:3000 (admin/admin)"
echo "  - Prometheus: http://localhost:9090"
echo ""
echo "📝 Pour tester la nouvelle logique:"
echo "  1. Créer une commande avec des produits"
echo "  2. Supprimer un produit → Les commandes contenant ce produit seront supprimées"
echo "  3. Supprimer une commande → Les stocks des produits seront ré-incrémentés" 