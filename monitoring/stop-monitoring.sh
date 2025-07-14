#!/bin/bash

echo "🛑 Arrêt du monitoring PayeTonKawa..."

cd "$(dirname "$0")"
docker-compose down

echo "✅ Monitoring arrêté !" 