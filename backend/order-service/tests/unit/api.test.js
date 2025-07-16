const { checkUserExists, getProductDetails, updateProductStock } = require('../../utils/api');

// Mock d'axios au lieu de fetch
jest.mock('axios');
const axios = require('axios');

// Mock console.error pour éviter le bruit dans les tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('order-service utils/api', () => {
  beforeEach(() => {
    axios.get.mockClear();
    axios.put.mockClear();
  });

  describe('checkUserExists', () => {
    it('should return user data if user exists', async () => {
      const mockUser = { id: 1, name: 'Test User' };
      axios.get.mockResolvedValueOnce({ data: mockUser });

      const result = await checkUserExists(1);
      expect(result).toEqual(mockUser);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/users/1')
      );
    });

    it('should return null if user does not exist', async () => {
      axios.get.mockRejectedValueOnce(new Error('User not found'));

      const result = await checkUserExists(999);
      expect(result).toBe(null);
    });

    it('should return null if axios fails', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await checkUserExists(1);
      expect(result).toBe(null);
    });
  });

  describe('getProductDetails', () => {
    it('should return product if found', async () => {
      const mockProduct = { id: 1, name: 'Test Product', price: 10.50 };
      axios.get.mockResolvedValueOnce({ data: mockProduct });

      const result = await getProductDetails(1);
      expect(result).toEqual(mockProduct);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/products/1')
      );
    });

    it('should return null if not found', async () => {
      axios.get.mockRejectedValueOnce(new Error('Product not found'));

      const result = await getProductDetails(999);
      expect(result).toBeNull();
    });

    it('should return null if axios fails', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await getProductDetails(1);
      expect(result).toBeNull();
    });
  });

  describe('updateProductStock', () => {
    it('should return response data if stock updated successfully', async () => {
      const mockResponse = { success: true };
      axios.put.mockResolvedValueOnce({ data: mockResponse });

      const result = await updateProductStock(1, 95);
      expect(result).toEqual(mockResponse);
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/api/products/1/stock'),
        { quantity: 95 }
      );
    });

    it('should return null if update fails', async () => {
      axios.put.mockRejectedValueOnce(new Error('Update failed'));

      const result = await updateProductStock(1, 95);
      expect(result).toBe(null);
    });

    it('should return null if axios throws', async () => {
      axios.put.mockRejectedValueOnce(new Error('Network error'));

      const result = await updateProductStock(1, 95);
      expect(result).toBe(null);
    });
  });
}); 