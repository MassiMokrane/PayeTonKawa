// Mock toutes les dépendances externes avant les imports
jest.mock('../rabbitmq', () => ({
  publishEvent: jest.fn(),
  connectAndListenRabbitMQ: jest.fn(),
  rabbitmqPublishCounter: { inc: jest.fn() },
  rabbitmqConsumeCounter: { inc: jest.fn() },
}));

jest.mock('../config/db', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(),
    query: jest.fn().mockResolvedValue(),
    define: jest.fn().mockReturnValue({
      sync: jest.fn().mockResolvedValue(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
    }),
  },
  connectDB: jest.fn().mockResolvedValue(),
}));

jest.mock('../models/product.model', () => ({
  Product: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    sync: jest.fn().mockResolvedValue(),
  },
  initializeProductModel: jest.fn().mockResolvedValue(),
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.fn().mockReturnValue('/mock/path'),
  extname: jest.fn().mockReturnValue('.jpg'),
}));

const { createProduct, getProducts, getProductById, updateProduct, updateProductStock, deleteProduct } = require('../controllers/product.controller');
const { isAuthenticated, isAdmin } = require('../middlewares/auth.middleware');
const { Product } = require('../models/product.model');
const jwt = require('jsonwebtoken');
const fs = require('fs');

jest.mock('jsonwebtoken');

describe('Product Service Unit Tests', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'testsecret';
    process.env.DB_HOST = 'localhost';
    process.env.DB_USER = 'root';
    process.env.DB_PASSWORD = 'test';
    process.env.DB_NAME = 'test_productdb';
    process.env.DB_PORT = '3306';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper pour mocker les réponses
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  describe('Middleware Tests', () => {
    describe('isAuthenticated', () => {
      it('should call next if token is valid', () => {
        const user = { id: 1, role: 'admin' };
        const req = { headers: { authorization: 'Bearer validtoken' } };
        const res = {};
        const next = jest.fn();
        
        jwt.verify = jest.fn().mockReturnValue(user);
        
        isAuthenticated(req, res, next);
        expect(req.user).toMatchObject(user);
        expect(next).toHaveBeenCalled();
      });

      it('should return 401 if no token', () => {
        const req = { headers: {} };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        
        isAuthenticated(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ msg: 'Non autorisé' });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 401 if token is invalid', () => {
        const req = { headers: { authorization: 'Bearer invalidtoken' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        
        jwt.verify = jest.fn().mockImplementation(() => {
          throw new Error('jwt malformed');
        });
        
        // Spy sur console.error pour éviter l'affichage dans les tests
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        isAuthenticated(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ msg: 'Token invalide ou expiré' });
        expect(next).not.toHaveBeenCalled();
        
        consoleSpy.mockRestore();
      });
    });

    describe('isAdmin', () => {
      it('should call next if user is admin', () => {
        const req = { user: { role: 'admin' } };
        const res = {};
        const next = jest.fn();
        
        isAdmin(req, res, next);
        expect(next).toHaveBeenCalled();
      });

      it('should return 403 if user is not admin', () => {
        const req = { user: { role: 'client' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        
        isAdmin(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ msg: "Accès réservé à l'admin" });
        expect(next).not.toHaveBeenCalled();
      });
    });
  });

  describe('Controller Tests', () => {
    describe('createProduct', () => {
      it('crée un produit sans image', async () => {
        Product.create.mockResolvedValue({ id: 1, name: 'Café', price: 2.5 });
        
        const req = { body: { name: 'Café', price: 2.5 } };
        const res = mockRes();
        
        await createProduct(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'Café', price: 2.5 });
      });

      it('crée un produit avec image', async () => {
        Product.create.mockResolvedValue({ id: 2, name: 'Thé', price: 3, image: '/uploads/img.png' });
        
        const req = { 
          body: { name: 'Thé', price: 3 }, 
          file: { filename: 'img.png' } 
        };
        const res = mockRes();
        
        await createProduct(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ id: 2, name: 'Thé', price: 3, image: '/uploads/img.png' });
      });

      it('gère une erreur serveur', async () => {
        Product.create.mockRejectedValue(new Error('fail'));
        
        const req = { 
          body: { name: 'X', price: 1 }, 
          file: { filename: 'img.png' } 
        };
        const res = mockRes();
        
        fs.existsSync.mockReturnValue(true);
        
        await createProduct(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('getProducts', () => {
      it('retourne la liste des produits', async () => {
        Product.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
        
        const req = {};
        const res = mockRes();
        
        await getProducts(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
      });

      it('gère une erreur serveur lors de getProducts', async () => {
        Product.findAll.mockRejectedValue(new Error('fail'));
        
        const req = {};
        const res = mockRes();
        
        await getProducts(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('getProductById', () => {
      it('retourne un produit existant', async () => {
        Product.findByPk.mockResolvedValue({ id: 1 });
        
        const req = { params: { id: 1 } };
        const res = mockRes();
        
        await getProductById(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ id: 1 });
      });

      it('404 si produit non trouvé', async () => {
        Product.findByPk.mockResolvedValue(null);
        
        const req = { params: { id: 1 } };
        const res = mockRes();
        
        await getProductById(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
      });

      it('gère une erreur serveur lors de getProductById', async () => {
        Product.findByPk.mockRejectedValue(new Error('fail'));
        
        const req = { params: { id: 1 } };
        const res = mockRes();
        
        await getProductById(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('updateProduct', () => {
      it('met à jour un produit existant', async () => {
        Product.findByPk.mockResolvedValueOnce({ id: 1, name: 'Café' });
        Product.update.mockResolvedValue([1]);
        Product.findByPk.mockResolvedValueOnce({ id: 1, name: 'Café modifié' });
        
        const req = { params: { id: 1 }, body: { name: 'Café modifié' } };
        const res = mockRes();
        
        await updateProduct(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'Café modifié' });
      });

      it('404 si produit non trouvé lors de la mise à jour', async () => {
        Product.findByPk.mockResolvedValue(null);
        
        const req = { params: { id: 1 }, body: { name: 'Café' } };
        const res = mockRes();
        
        await updateProduct(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
      });

      it('gère une erreur serveur lors de updateProduct', async () => {
        Product.findByPk.mockRejectedValue(new Error('fail'));
        
        const req = { params: { id: 1 }, body: { name: 'Café' } };
        const res = mockRes();
        
        await updateProduct(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('updateProductStock', () => {
      it('met à jour le stock d\'un produit', async () => {
        const mockProduct = {
          id: 1,
          name: 'Café',
          quantity: 50,
          update: jest.fn().mockResolvedValue()
        };
        Product.findByPk.mockResolvedValue(mockProduct);
        
        const req = { params: { id: 1 }, body: { quantity: 100 } };
        const res = mockRes();
        
        await updateProductStock(req, res);
        expect(mockProduct.update).toHaveBeenCalledWith({ quantity: 100 });
        expect(res.json).toHaveBeenCalledWith({
          message: 'Stock mis à jour avec succès',
          product: {
            id: 1,
            name: 'Café',
            quantity: 50
          }
        });
      });

      it('400 si quantité invalide', async () => {
        const req = { params: { id: 1 }, body: { quantity: -1 } };
        const res = mockRes();
        
        await updateProductStock(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('404 si produit non trouvé pour mise à jour stock', async () => {
        Product.findByPk.mockResolvedValue(null);
        
        const req = { params: { id: 1 }, body: { quantity: 100 } };
        const res = mockRes();
        
        await updateProductStock(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
      });
    });

    describe('deleteProduct', () => {
      it('supprime un produit existant', async () => {
        Product.findByPk.mockResolvedValue({ id: 1, image: null, name: 'Café' });
        Product.destroy.mockResolvedValue(1);
        
        const req = { params: { id: 1 } };
        const res = mockRes();
        
        await deleteProduct(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Product deleted' });
      });

      it('404 si produit non trouvé lors de la suppression', async () => {
        Product.findByPk.mockResolvedValue(null);
        
        const req = { params: { id: 1 } };
        const res = mockRes();
        
        await deleteProduct(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
      });

      it('gère une erreur serveur lors de deleteProduct', async () => {
        Product.findByPk.mockRejectedValue(new Error('fail'));
        
        const req = { params: { id: 1 } };
        const res = mockRes();
        
        await deleteProduct(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });
  });

  describe('Model Tests', () => {
    it('crée un produit avec les champs requis', async () => {
      Product.create.mockResolvedValue({ 
        id: 1, 
        name: 'Café', 
        price: 2.5,
        quantity: 100
      });
      
      const product = await Product.create({ name: 'Café', price: 2.5, quantity: 100 });
      expect(product.id).toBeDefined();
      expect(product.name).toBe('Café');
      expect(product.price).toBe(2.5);
    });

    it('accepte une image optionnelle', async () => {
      Product.create.mockResolvedValue({ 
        id: 2, 
        name: 'Thé', 
        price: 3, 
        image: '/uploads/img.png' 
      });
      
      const product = await Product.create({ 
        name: 'Thé', 
        price: 3, 
        image: '/uploads/img.png' 
      });
      expect(product.image).toBe('/uploads/img.png');
    });
  });
});
