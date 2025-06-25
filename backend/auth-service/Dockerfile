# # backend/auth-service/Dockerfile
# FROM node:18
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# CMD ["npx", "nodemon", "app.js"]


FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npx", "nodemon", "app.js"]