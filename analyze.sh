#!/bin/sh

# Remplace cette valeur par ton vrai token SonarQube (voir instructions ci-dessous)
SONAR_TOKEN="sqa_a92e999e0eded1698b38572df4ffcd28ab0333d7"
SONAR_HOST_URL="http://localhost:9000"

# Analyse backend
sonar-scanner \
  -Dsonar.projectKey=paye-ton-kawa-backend \
  -Dsonar.sources=backend \
  -Dsonar.host.url=$SONAR_HOST_URL \
  -Dsonar.token=$SONAR_TOKEN

echo "Analyse backend terminée."

# Analyse frontend
sonar-scanner \
  -Dsonar.projectKey=paye-ton-kawa-frontend \
  -Dsonar.sources=frontend \
  -Dsonar.host.url=$SONAR_HOST_URL \
  -Dsonar.login=$SONAR_TOKEN

echo "Analyse frontend terminée." 