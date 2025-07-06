// product-service/utils/rabbitListener.js
const amqp = require("amqplib");
const { Product } = require("../models/product.model");

const listenForMessages = async () => {
  try {
    const connection = await amqp.connect("amqp://admin:password@rabbitmq");
    const channel = await connection.createChannel();
    await channel.assertQueue("product-queue", { durable: true });

    console.log("📥 Waiting for messages in product-queue...");

    channel.consume("product-queue", async (msg) => {
      if (msg !== null) {
        const content = JSON.parse(msg.content.toString());

        if (content.type === "UPDATE_quantity") {
          const { productId, quantity } = content.data;

          const product = await Product.findByPk(productId);
          if (!product) {
            console.error("❌ Produit non trouvé pour mise à jour de quantity");
            return channel.ack(msg); // Évite blocage
          }

          if (product.quantity < quantity) {
            console.error("❌ quantity insuffisant");
            return channel.ack(msg);
          }

          product.quantity -= quantity;
          await product.save();
          console.log(
            `✅ quantity mis à jour pour le produit ${productId}, nouveau quantity: ${product.quantity}`
          );
        }

        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("❌ Erreur RabbitMQ dans product-service:", error);
  }
};

module.exports = listenForMessages;
