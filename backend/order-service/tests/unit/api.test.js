// Ce fichier mocke global.fetch pour éviter les vrais appels réseau et console.error pour éviter le bruit dans les tests.
jest.mock('node-fetch', () => jest.fn());
const fetch = require('node-fetch');

beforeAll(() => {
  jest.spyOn(process, 'exit').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  process.exit.mockRestore();
  console.error.mockRestore();
});
beforeEach(() => {
  fetch.mockReset();
});
const { checkUserExists, getProductDetails, updateProductStock } = require('../../utils/api');

describe('order-service utils/api', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkUserExists', () => {
    it('should return true if user exists', async () => {
      fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1 }) });
      const result = await checkUserExists(1);
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalled();
    });
    it('should return false if user does not exist', async () => {
      fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
      const result = await checkUserExists(999);
      expect(result).toBe(false);
    });
    it('should return false if fetch fails', async () => {
      fetch.mockRejectedValueOnce(new Error('fail'));
      const result = await checkUserExists(1);
      expect(result).toBe(false);
    });
  });

  describe('getProductDetails', () => {
    it('should return product if found', async () => {
      fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1, name: 'prod' }) });
      const result = await getProductDetails(1);
      expect(result).toEqual({ id: 1, name: 'prod' });
    });
    it('should return null if not found', async () => {
      fetch.mockResolvedValueOnce({ ok: false });
      const result = await getProductDetails(999);
      expect(result).toBeNull();
    });
    it('should return null if fetch fails', async () => {
      fetch.mockRejectedValueOnce(new Error('fail'));
      const result = await getProductDetails(1);
      expect(result).toBeNull();
    });
  });

  describe('updateProductStock', () => {
    it('should return true if stock updated', async () => {
      fetch.mockResolvedValueOnce({ ok: true });
      const result = await updateProductStock(1, 10);
      expect(result).toBe(true);
    });
    it('should return false if update fails', async () => {
      fetch.mockResolvedValueOnce({ ok: false });
      const result = await updateProductStock(1, 10);
      expect(result).toBe(false);
    });
    it('should return false if fetch throws', async () => {
      fetch.mockRejectedValueOnce(new Error('fail'));
      const result = await updateProductStock(1, 10);
      expect(result).toBe(false);
    });
  });
}); 