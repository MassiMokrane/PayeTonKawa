const productService = require("../services/product.service");
const { Product } = require("../models/product.model");

// Mock des méthodes Sequelize utilisées
jest.mock("../models/product.model", () => ({
  Product: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
}));

describe("Product Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createProduct crée un produit", async () => {
    const productData = { name: "Produit test", category: "Cat", quantity: 5 };
    Product.create.mockResolvedValue(productData);

    const result = await productService.createProduct(productData);

    expect(Product.create).toHaveBeenCalledWith(productData);
    expect(result).toEqual(productData);
  });

  test("getProducts retourne une liste de produits", async () => {
    const products = [{ id: 1, name: "Prod1" }, { id: 2, name: "Prod2" }];
    Product.findAll.mockResolvedValue(products);

    const result = await productService.getProducts();

    expect(Product.findAll).toHaveBeenCalled();
    expect(result).toEqual(products);
  });

  test("getProductById retourne un produit", async () => {
    const product = { id: 1, name: "Prod1" };
    Product.findByPk.mockResolvedValue(product);

    const result = await productService.getProductById(1);

    expect(Product.findByPk).toHaveBeenCalledWith(1);
    expect(result).toEqual(product);
  });

  test("updateProduct met à jour un produit existant", async () => {
    const product = {
      id: 1,
      name: "Ancien nom",
      update: jest.fn().mockResolvedValue({ id: 1, name: "Nouveau nom" }),
    };
    Product.findByPk.mockResolvedValue(product);

    const result = await productService.updateProduct(1, { name: "Nouveau nom" });

    expect(Product.findByPk).toHaveBeenCalledWith(1);
    expect(product.update).toHaveBeenCalledWith({ name: "Nouveau nom" });
    expect(result).toEqual({ id: 1, name: "Nouveau nom" });
  });

  test("updateProduct retourne null si produit non trouvé", async () => {
    Product.findByPk.mockResolvedValue(null);

    const result = await productService.updateProduct(999, { name: "X" });

    expect(result).toBeNull();
  });

  test("deleteProduct supprime un produit existant", async () => {
    const product = {
      id: 1,
      destroy: jest.fn().mockResolvedValue(),
    };
    Product.findByPk.mockResolvedValue(product);

    const result = await productService.deleteProduct(1);

    expect(Product.findByPk).toHaveBeenCalledWith(1);
    expect(product.destroy).toHaveBeenCalled();
    expect(result).toEqual(product);
  });

  test("deleteProduct retourne null si produit non trouvé", async () => {
    Product.findByPk.mockResolvedValue(null);

    const result = await productService.deleteProduct(999);

    expect(result).toBeNull();
  });
});
