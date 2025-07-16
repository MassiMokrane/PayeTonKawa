const { register, login, getUsers, getUserById, updateUser, deleteUser } = require('../../controllers/auth.controller');
const { User } = require('../../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../../models/user.model');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../rabbitmq', () => ({ publishEvent: jest.fn() }));

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('auth.controller', () => {
  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('crée un utilisateur si email non utilisé', async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed');
      User.create.mockResolvedValue({ id: 1, nom: 'A', prenom: 'B', email: 'a@b.com', role: 'client' });
      const req = { body: { nom: 'A', prenom: 'B', email: 'a@b.com', password: 'pw' } };
      const res = mockRes();
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Utilisateur créé' });
    });
    it('refuse si email déjà utilisé', async () => {
      User.findOne.mockResolvedValue({ id: 1 });
      const req = { body: { email: 'a@b.com' } };
      const res = mockRes();
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Email déjà utilisé' });
    });
    it('gère une erreur serveur', async () => {
      User.findOne.mockRejectedValue(new Error('fail'));
      const req = { body: { email: 'a@b.com' } };
      const res = mockRes();
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('login', () => {
    it('connecte un utilisateur avec bon mot de passe', async () => {
      User.findOne.mockResolvedValue({ id: 1, email: 'a@b.com', password: 'hashed', role: 'client' });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token');
      const req = { body: { email: 'a@b.com', password: 'pw' } };
      const res = mockRes();
      await login(req, res);
      expect(res.json).toHaveBeenCalledWith({ token: 'token', role: 'client', id: 1 });
    });
    it('refuse si utilisateur non trouvé', async () => {
      User.findOne.mockResolvedValue(null);
      const req = { body: { email: 'a@b.com', password: 'pw' } };
      const res = mockRes();
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    it('refuse si mauvais mot de passe', async () => {
      User.findOne.mockResolvedValue({ id: 1, password: 'hashed' });
      bcrypt.compare.mockResolvedValue(false);
      const req = { body: { email: 'a@b.com', password: 'pw' } };
      const res = mockRes();
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
    it('gère une erreur serveur', async () => {
      User.findOne.mockRejectedValue(new Error('fail'));
      const req = { body: { email: 'a@b.com', password: 'pw' } };
      const res = mockRes();
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getUsers', () => {
    it('retourne la liste des utilisateurs', async () => {
      User.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      const req = {};
      const res = mockRes();
      await getUsers(req, res);
      expect(res.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
    });
    it('gère une erreur serveur', async () => {
      User.findAll.mockRejectedValue(new Error('fail'));
      const req = {};
      const res = mockRes();
      await getUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getUserById', () => {
    it('retourne un utilisateur existant', async () => {
      User.findByPk.mockResolvedValue({ id: 1 });
      const req = { params: { id: 1 } };
      const res = mockRes();
      await getUserById(req, res);
      expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });
    it('404 si utilisateur non trouvé', async () => {
      User.findByPk.mockResolvedValue(null);
      const req = { params: { id: 1 } };
      const res = mockRes();
      await getUserById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    it('gère une erreur serveur', async () => {
      User.findByPk.mockRejectedValue(new Error('fail'));
      const req = { params: { id: 1 } };
      const res = mockRes();
      await getUserById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateUser', () => {
    it('met à jour un utilisateur existant', async () => {
      User.update.mockResolvedValue([1]);
      User.findByPk.mockResolvedValue({ id: 1, nom: 'A' });
      const req = { params: { id: 1 }, body: { nom: 'A' } };
      const res = mockRes();
      await updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 1, nom: 'A' });
    });
    it('404 si utilisateur non trouvé', async () => {
      User.update.mockResolvedValue([0]);
      const req = { params: { id: 1 }, body: { nom: 'A' } };
      const res = mockRes();
      await updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    it('gère une erreur serveur', async () => {
      User.update.mockRejectedValue(new Error('fail'));
      const req = { params: { id: 1 }, body: { nom: 'A' } };
      const res = mockRes();
      await updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteUser', () => {
    it('supprime un utilisateur existant', async () => {
      User.destroy.mockResolvedValue(1);
      const req = { params: { id: 1 } };
      const res = mockRes();
      await deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Utilisateur supprimé' });
    });
    it('404 si utilisateur non trouvé', async () => {
      User.destroy.mockResolvedValue(0);
      const req = { params: { id: 1 } };
      const res = mockRes();
      await deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    it('gère une erreur serveur', async () => {
      User.destroy.mockRejectedValue(new Error('fail'));
      const req = { params: { id: 1 } };
      const res = mockRes();
      await deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
}); 