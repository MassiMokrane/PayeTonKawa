const { Product } = require("../models/product.model");
const fs = require("fs");
const path = require("path");
const { publishEvent } = require("../rabbitmq");
const client = require('prom-client');

const businessEventCounter = new client.Counter({
  name: 'business_events_total',
  help: 'Nombre total d’événements métier publiés',
  labelNames: ['event_type', 'service']
});

exports.createProduct = async (req, res) => {
  try {
    // Préparer les données du produit
    const productData = { ...req.body };
    if (req.file) {
      console.log("[UPLOAD] Fichier image reçu :", req.file.filename);
      productData.image = `/uploads/${req.file.filename}`;
    } else {
      console.log("[UPLOAD] Aucun fichier image reçu pour ce produit.");
    }
    const product = await Product.create(productData);
    // Publier l'événement product_created
    publishEvent('product_created', { productId: product.id, ...product.dataValues, date: new Date() });
    businessEventCounter.inc({ event_type: 'product_created', service: 'product-service' });
    res.status(201).json(product);
  } catch (error) {
    if (req.file) {
      const imagePath = path.join(__dirname, "../uploads", req.file.filename);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    res.status(500).json({ error: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    const updateData = { ...req.body };
    if (req.file) {
      if (product.image) {
        const oldImagePath = path.join(__dirname, "..", product.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.image = `/uploads/${req.file.filename}`;
    }
    const [updated] = await Product.update(updateData, {
      where: { id: req.params.id },
    });
    if (!updated) return res.status(404).json({ error: "Product not found" });
    const updatedProduct = await Product.findByPk(req.params.id);
    // Publier l'événement product_updated
    publishEvent('product_updated', { productId: updatedProduct.id, ...updatedProduct.dataValues, date: new Date() });
    businessEventCounter.inc({ event_type: 'product_updated', service: 'product-service' });
    res.status(200).json(updatedProduct);
  } catch (error) {
    if (req.file) {
      const imagePath = path.join(__dirname, "../uploads", req.file.filename);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.image) {
      const imagePath = path.join(__dirname, "..", product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    const deleted = await Product.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    // Publier l'événement product_deleted
    publishEvent('product_deleted', { productId: req.params.id, productName: product.name, date: new Date() });
    businessEventCounter.inc({ event_type: 'product_deleted', service: 'product-service' });
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
