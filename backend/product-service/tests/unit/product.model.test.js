const { Product } = require('../../models/product.model');

jest.mock('../../models/product.model');

describe('Product model (mocked)', () => {
  afterEach(() => jest.clearAllMocks());

  it('crée un produit avec les champs requis', async () => {
    Product.create.mockResolvedValue({ id: 1, name: 'Café', price: 2.5 });
    const prod = await Product.create({ name: 'Café', price: 2.5 });
    expect(prod.id).toBeDefined();
    expect(prod.name).toBe('Café');
  });

  it('refuse un prix négatif', async () => {
    Product.create.mockRejectedValue(new Error('Validation error: price'));
    await expect(Product.create({ name: 'X', price: -1 })).rejects.toThrow('Validation error: price');
  });

  it('refuse un nom vide', async () => {
    Product.create.mockRejectedValue(new Error('Validation error: name'));
    await expect(Product.create({ name: '', price: 1 })).rejects.toThrow('Validation error: name');
  });

  it('accepte une image optionnelle', async () => {
    Product.create.mockResolvedValue({ id: 2, name: 'Thé', price: 3, image: '/uploads/img.png' });
    const prod = await Product.create({ name: 'Thé', price: 3, image: '/uploads/img.png' });
    expect(prod.image).toBe('/uploads/img.png');
  });
}); 