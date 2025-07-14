FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY admin-event-server.js ./
CMD ["node", "admin-event-server.js"] 