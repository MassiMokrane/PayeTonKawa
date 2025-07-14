#!/bin/bash

echo "🚀 Démarrage du monitoring PayeTonKawa..."

# Créer le réseau monitoring s'il n'existe pas
echo "📡 Création du réseau monitoring..."
docker network create monitoring 2>/dev/null || echo "Réseau monitoring déjà existant"

# Démarrer les services de monitoring
echo "🔧 Démarrage de Prometheus et Grafana..."
cd "$(dirname "$0")"
docker-compose up -d

echo "✅ Monitoring démarré !"
echo ""
echo "📊 Accès aux services :"
echo "   - Grafana: http://localhost:3000 (admin/admin)"
echo "   - Prometheus: http://localhost:9090"
echo ""
echo "📈 Dashboard PayeTonKawa disponible dans Grafana"
echo "🔄 Rafraîchissement automatique toutes les 5 secondes" 