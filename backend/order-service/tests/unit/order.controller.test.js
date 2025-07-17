// Mock toutes les dépendances
jest.mock('../../models', () => ({
  Order: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  OrderItem: {
    bulkCreate: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.mock('../../utils/api', () => ({
  getProductDetails: jest.fn(),
  updateProductStock: jest.fn(),
  checkUserExists: jest.fn(),
  publishToQueue: jest.fn(),
}));

jest.mock('../../rabbitmq', () => ({
  publishEvent: jest.fn(),
}));

jest.mock('prom-client', () => ({
  Counter: function () { return { inc: jest.fn() }; },
}));

const { createOrder, getOrders, getOrderById, updateOrder, deleteOrder, getOrdersByUserId } = require('../../controllers/order.controller');
const { Order, OrderItem } = require('../../models');
const { getProductDetails, updateProductStock } = require('../../utils/api');

describe('order.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper pour mocker les réponses
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  describe('createOrder', () => {
    it('crée une commande avec succès', async () => {
      const mockOrder = { id: 1, userId: 1, total: 5, status: 'pending' };
      getProductDetails.mockResolvedValue({ id: 1, name: 'Café', price: 2.5, quantity: 100 });
      updateProductStock.mockResolvedValue(true);
      Order.create.mockResolvedValue(mockOrder);
      OrderItem.bulkCreate.mockResolvedValue([]);
      Order.findByPk.mockResolvedValue({
        ...mockOrder,
        items: [{ id: 1, productId: 1, quantity: 2, unitPrice: 2.5, totalPrice: 5 }]
      });
      
      const req = { 
        body: { 
          userId: 1, 
          items: [{ productId: 1, quantity: 2 }] 
        } 
      };
      const res = mockRes();
      
      await createOrder(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Commande créée avec succès'
      }));
    });

    it('refuse une commande avec liste d\'items vide', async () => {
      const req = { body: { userId: 1, items: [] } };
      const res = mockRes();
      
      await createOrder(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "La liste des produits est vide ou invalide"
      });
    });

    it('refuse une commande si produit non trouvé', async () => {
      getProductDetails.mockResolvedValue(null);
      
      const req = { 
        body: { 
          userId: 1, 
          items: [{ productId: 999, quantity: 1 }] 
        } 
      };
      const res = mockRes();
      
      await createOrder(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Produit 999 introuvable"
      });
    });

    it('refuse une commande si stock insuffisant', async () => {
      getProductDetails.mockResolvedValue({ id: 1, name: 'Café', price: 2.5, quantity: 1 });
      
      const req = { 
        body: { 
          userId: 1, 
          items: [{ productId: 1, quantity: 5 }] 
        } 
      };
      const res = mockRes();
      
      await createOrder(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Stock insuffisant pour le produit 1. Stock disponible: 1, demandé: 5"
      });
    });

    it('gère une erreur serveur', async () => {
      getProductDetails.mockRejectedValue(new Error('Service indisponible'));
      
      const req = { 
        body: { 
          userId: 1, 
          items: [{ productId: 1, quantity: 1 }] 
        } 
      };
      const res = mockRes();
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      await createOrder(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      
      consoleSpy.mockRestore();
    });
  });

  describe('getOrders', () => {
    it('retourne la liste des commandes', async () => {
      const mockOrders = [
        { id: 1, userId: 1, total: 5, items: [] },
        { id: 2, userId: 2, total: 10, items: [] }
      ];
      Order.findAll.mockResolvedValue(mockOrders);
      
      const req = {};
      const res = mockRes();
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      await getOrders(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockOrders);
      
      consoleSpy.mockRestore();
    });

    it('gère une erreur serveur lors de getOrders', async () => {
      Order.findAll.mockRejectedValue(new Error('Database error'));
      
      const req = {};
      const res = mockRes();
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      await getOrders(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      
      consoleSpy.mockRestore();
      logSpy.mockRestore();
    });
  });

  describe('getOrderById', () => {
    it('retourne une commande existante', async () => {
      const mockOrder = { id: 1, userId: 1, total: 5, items: [] };
      Order.findByPk.mockResolvedValue(mockOrder);
      
      const req = { params: { id: 1 } };
      const res = mockRes();
      
      await getOrderById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockOrder);
    });

    it('404 si commande non trouvée', async () => {
      Order.findByPk.mockResolvedValue(null);
      
      const req = { params: { id: 999 } };
      const res = mockRes();
      
      await getOrderById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Commande non trouvée" });
    });

    it('gère une erreur serveur lors de getOrderById', async () => {
      Order.findByPk.mockRejectedValue(new Error('Database error'));
      
      const req = { params: { id: 1 } };
      const res = mockRes();
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      await getOrderById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      
      consoleSpy.mockRestore();
    });
  });

  describe('updateOrder', () => {
    it('met à jour une commande existante', async () => {
      const mockOrder = { 
        id: 1, 
        userId: 1, 
        total: 5, 
        status: 'pending',
        update: jest.fn().mockResolvedValue()
      };
      const updatedOrder = { ...mockOrder, status: 'completed' };
      
      Order.findByPk.mockResolvedValueOnce(mockOrder);
      Order.findByPk.mockResolvedValueOnce(updatedOrder);
      
      const req = { 
        params: { id: 1 }, 
        body: { status: 'completed' } 
      };
      const res = mockRes();
      
      await updateOrder(req, res);
      expect(mockOrder.update).toHaveBeenCalledWith({ status: 'completed' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedOrder);
    });

    it('404 si commande non trouvée lors de la mise à jour', async () => {
      Order.findByPk.mockResolvedValue(null);
      
      const req = { 
        params: { id: 999 }, 
        body: { status: 'completed' } 
      };
      const res = mockRes();
      
      await updateOrder(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Commande non trouvée" });
    });

    it('gère une erreur serveur lors de updateOrder', async () => {
      Order.findByPk.mockRejectedValue(new Error('Database error'));
      
      const req = { 
        params: { id: 1 }, 
        body: { status: 'completed' } 
      };
      const res = mockRes();
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      await updateOrder(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      
      consoleSpy.mockRestore();
    });
  });

  describe('deleteOrder', () => {
    it('supprime une commande existante', async () => {
      const mockOrder = { 
        id: 1, 
        userId: 1, 
        items: [{ productId: 1, quantity: 2 }],
        destroy: jest.fn().mockResolvedValue()
      };
      Order.findByPk.mockResolvedValue(mockOrder);
      
      const req = { params: { id: 1 } };
      const res = mockRes();
      
      await deleteOrder(req, res);
      expect(mockOrder.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it('404 si commande non trouvée lors de la suppression', async () => {
      Order.findByPk.mockResolvedValue(null);
      
      const req = { params: { id: 999 } };
      const res = mockRes();
      
      await deleteOrder(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Commande non trouvée" });
    });

    it('gère une erreur serveur lors de deleteOrder', async () => {
      Order.findByPk.mockRejectedValue(new Error('Database error'));
      
      const req = { params: { id: 1 } };
      const res = mockRes();
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      await deleteOrder(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      
      consoleSpy.mockRestore();
    });
  });

  describe('getOrdersByUserId', () => {
    it('retourne les commandes d\'un utilisateur', async () => {
      const mockOrders = [
        { id: 1, userId: 1, total: 5, items: [] }
      ];
      Order.findAll.mockResolvedValue(mockOrders);
      
      const req = { params: { userId: 1 } };
      const res = mockRes();
      
      await getOrdersByUserId(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockOrders);
    });

    it('gère une erreur serveur lors de getOrdersByUserId', async () => {
      Order.findAll.mockRejectedValue(new Error('Database error'));
      
      const req = { params: { userId: 1 } };
      const res = mockRes();
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      await getOrdersByUserId(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      
      consoleSpy.mockRestore();
    });
  });
});
