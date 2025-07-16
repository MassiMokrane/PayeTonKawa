const { createProduct, getProducts, getProductById, updateProduct, deleteProduct } = require('../../controllers/product.controller');
const { Product } = require('../../models/product.model');
const fs = require('fs');
const path = require('path');

jest.mock('../../models/product.model');
jest.mock('fs');
jest.mock('path');
jest.mock('../../rabbitmq', () => ({ publishEvent: jest.fn() }));

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('product.controller', () => {
  afterEach(() => jest.clearAllMocks());

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
      const req = { body: { name: 'Thé', price: 3 }, file: { filename: 'img.png' } };
      const res = mockRes();
      await createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 2, name: 'Thé', price: 3, image: '/uploads/img.png' });
    });
    it('gère une erreur serveur', async () => {
      Product.create.mockRejectedValue(new Error('fail'));
      const req = { body: { name: 'X', price: 1 }, file: { filename: 'img.png' } };
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
    it('gère une erreur serveur', async () => {
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
    it('gère une erreur serveur', async () => {
      Product.findByPk.mockRejectedValue(new Error('fail'));
      const req = { params: { id: 1 } };
      const res = mockRes();
      await getProductById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateProduct', () => {
    it('met à jour un produit existant', async () => {
      Product.findByPk.mockResolvedValue({ id: 1, name: 'Café' });
      Product.update.mockResolvedValue([1]);
      const req = { params: { id: 1 }, body: { name: 'Café' } };
      const res = mockRes();
      await updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    it('404 si produit non trouvé', async () => {
      Product.findByPk.mockResolvedValue(null);
      const req = { params: { id: 1 }, body: { name: 'Café' } };
      const res = mockRes();
      await updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    it('gère une erreur serveur', async () => {
      Product.findByPk.mockRejectedValue(new Error('fail'));
      const req = { params: { id: 1 }, body: { name: 'Café' } };
      const res = mockRes();
      await updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteProduct', () => {
    it('supprime un produit existant', async () => {
      Product.findByPk.mockResolvedValue({ id: 1, image: null });
      Product.destroy.mockResolvedValue(1);
      const req = { params: { id: 1 } };
      const res = mockRes();
      await deleteProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product deleted' });
    });
    it('404 si produit non trouvé', async () => {
      Product.findByPk.mockResolvedValue(null);
      const req = { params: { id: 1 } };
      const res = mockRes();
      await deleteProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    it('gère une erreur serveur', async () => {
      Product.findByPk.mockRejectedValue(new Error('fail'));
      const req = { params: { id: 1 } };
      const res = mockRes();
      await deleteProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
}); 