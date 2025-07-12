// const { Product } = require("../models/product.model");

// exports.createProduct = async (req, res) => {
//   try {
//     const product = await Product.create(req.body);
//     res.status(201).json(product);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getProducts = async (req, res) => {
//   try {
//     const products = await Product.findAll();
//     res.status(200).json(products);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getProductById = async (req, res) => {
//   try {
//     const product = await Product.findByPk(req.params.id);
//     if (!product) return res.status(404).json({ error: "Product not found" });
//     res.status(200).json(product);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.updateProduct = async (req, res) => {
//   try {
//     const [updated] = await Product.update(req.body, {
//       where: { id: req.params.id },
//     });
//     if (!updated) return res.status(404).json({ error: "Product not found" });
//     res.status(200).json({ message: "Product updated" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.deleteProduct = async (req, res) => {
//   try {
//     const deleted = await Product.destroy({ where: { id: req.params.id } });
//     if (!deleted) return res.status(404).json({ error: "Product not found" });
//     res.status(200).json({ message: "Product deleted" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
const { Product } = require("../models/product.model");
const fs = require("fs");
const path = require("path");

exports.createProduct = async (req, res) => {
  try {
    // Préparer les données du produit
    const productData = { ...req.body };

    // Log pour debug upload image
    if (req.file) {
      console.log("[UPLOAD] Fichier image reçu :", req.file.filename);
      productData.image = `/uploads/${req.file.filename}`;
    } else {
      console.log("[UPLOAD] Aucun fichier image reçu pour ce produit.");
    }

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    // Supprimer l'image uploadée en cas d'erreur
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

    // Préparer les données de mise à jour
    const updateData = { ...req.body };

    // Gérer la nouvelle image
    if (req.file) {
      // Supprimer l'ancienne image si elle existe
      if (product.image) {
        const oldImagePath = path.join(__dirname, "..", product.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      // Ajouter la nouvelle image
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const [updated] = await Product.update(updateData, {
      where: { id: req.params.id },
    });

    if (!updated) return res.status(404).json({ error: "Product not found" });

    // Retourner le produit mis à jour
    const updatedProduct = await Product.findByPk(req.params.id);
    res.status(200).json(updatedProduct);
  } catch (error) {
    // Supprimer l'image uploadée en cas d'erreur
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

    // Supprimer l'image associée si elle existe
    if (product.image) {
      const imagePath = path.join(__dirname, "..", product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    const deleted = await Product.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: "Product not found" });

    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
