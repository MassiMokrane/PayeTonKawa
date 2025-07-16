FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
# Installer les dépendances (production uniquement) et nodemon globalement pour le développement, sans exécuter de scripts
RUN npm ci --only=production --ignore-scripts && npm install -g nodemon --ignore-scripts

# Copier le code source
COPY . .

# Exposer le port du service order (5002)
EXPOSE 5002

# Démarrer l'application
CMD ["node", "server.js"]
