const request = require('supertest');
const express = require('express');
const app = require('../app');
const { User } = require('../models/user.model');
const { sequelize } = require('../config/db');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

describe('Tests d\'intégration Auth Service', () => {
  let createdUserId;
  const userData = {
    nom: 'Test',
    prenom: 'Integration',
    email: `integration${Date.now()}@example.com`,
    password: 'integrationPass123',
    role: 'client',
  };

  it('1. Création d\'un utilisateur', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('msg', 'Utilisateur créé');
    // Récupérer l'utilisateur créé en base
    const user = await User.findOne({ where: { email: userData.email } });
    expect(user).toBeTruthy();
    expect(user.nom).toBe(userData.nom);
    expect(user.prenom).toBe(userData.prenom);
    expect(user.email).toBe(userData.email);
    expect(user.role).toBe(userData.role);
    createdUserId = user.id;
  });

  it('2. Récupération de l\'utilisateur créé', async () => {
    const res = await request(app)
      .get(`/api/auth/users/${createdUserId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdUserId);
    expect(res.body).toHaveProperty('email', userData.email);
    expect(res.body).toHaveProperty('nom', userData.nom);
    expect(res.body).toHaveProperty('prenom', userData.prenom);
    expect(res.body).toHaveProperty('role', userData.role);
    expect(res.body).not.toHaveProperty('password');
  });

  it('3. Authentification utilisateur, retourne un token JWT valide', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: userData.email, password: userData.password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('role', userData.role);
    expect(res.body).toHaveProperty('id', createdUserId);
    // Vérifier que le token est décodable et contient les bons champs
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(res.body.token);
    expect(decoded).toHaveProperty('id', createdUserId);
    expect(decoded).toHaveProperty('role', userData.role);
  });

  it('4. Modification utilisateur et vérification', async () => {
    const newData = {
      nom: 'Modif',
      prenom: 'User',
      email: `modif${Date.now()}@example.com`,
      role: 'admin',
    };
    // Modification
    const res = await request(app)
      .put(`/api/auth/users/${createdUserId}`)
      .send(newData);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('msg', 'Utilisateur mis à jour');
    // Vérification
    const user = await User.findByPk(createdUserId);
    expect(user.nom).toBe(newData.nom);
    expect(user.prenom).toBe(newData.prenom);
    expect(user.email).toBe(newData.email);
    expect(user.role).toBe(newData.role);
  });
}); 