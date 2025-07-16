jest.mock('../../rabbitmq', () => ({
  publishEvent: jest.fn(),
  connectAndListenRabbitMQ: jest.fn(),
  rabbitmqPublishCounter: { inc: jest.fn() },
  rabbitmqConsumeCounter: { inc: jest.fn() },
}));
const request = require('supertest');
const app = require('../../app');
const { User, initializeUserModel } = require('../../models/user.model');
const jwt = require('jsonwebtoken');


describe('auth-service integration', () => {
  let adminToken, userToken, adminId, userId;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret';
    await initializeUserModel();
    await User.destroy({ where: {} });
    // Crée un admin
    const admin = await User.create({ nom: 'Admin', prenom: 'Root', email: 'admin@test.com', password: await require('bcrypt').hash('adminpass', 10), role: 'admin' });
    adminId = admin.id;
    adminToken = jwt.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET);
    // Crée un user
    const user = await User.create({ nom: 'User', prenom: 'Test', email: 'user@test.com', password: await require('bcrypt').hash('userpass', 10), role: 'client' });
    userId = user.id;
    userToken = jwt.sign({ id: user.id, role: 'client' }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await User.destroy({ where: {} });
  });

  it('POST /api/auth/register crée un nouvel utilisateur', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nom: 'Jean', prenom: 'Dupont', email: 'jean@test.com', password: 'azerty', role: 'client' });
    expect(res.statusCode).toBe(201);
    expect(res.body.msg).toBe('Utilisateur créé');
  });

  it('POST /api/auth/login connecte un utilisateur', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'userpass' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.role).toBe('client');
  });

  it('GET /api/auth/users (admin) retourne la liste des utilisateurs', async () => {
    const res = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it('GET /api/auth/users/:id (admin) retourne un utilisateur', async () => {
    const res = await request(app)
      .get(`/api/auth/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('user@test.com');
  });

  it('PUT /api/auth/users/:id (admin) modifie un utilisateur', async () => {
    const res = await request(app)
      .put(`/api/auth/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nom: 'UserModif' });
    expect(res.statusCode).toBe(200);
    expect(res.body.nom).toBe('UserModif');
  });

  it('DELETE /api/auth/users/:id (admin) supprime un utilisateur', async () => {
    const newUser = await User.create({ nom: 'ToDelete', prenom: 'User', email: 'delete@test.com', password: await require('bcrypt').hash('deletepass', 10), role: 'client' });
    const res = await request(app)
      .delete(`/api/auth/users/${newUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe('Utilisateur supprimé');
  });

  it('GET /api/auth/health retourne le status UP', async () => {
    const res = await request(app).get('/api/auth/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('auth-service');
  });
}); 