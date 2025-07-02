const amqp = require("amqplib");
const { deleteProductById } = require("../controllers/product.controller");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const ORDER_QUEUE = "order-product-queue";

async function listenForMessages() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(ORDER_QUEUE, { durable: true });

    console.log(`📥 En écoute sur la file : ${ORDER_QUEUE}`);

    channel.consume(ORDER_QUEUE, async (msg) => {
      if (msg !== null) {
        try {
          const content = msg.content.toString();
          const { productId } = JSON.parse(content);

          console.log("🛠️ Message reçu de Order-Service :", productId);

          if (productId) {
            await deleteProductById(productId);
            console.log(`🗑️ Produit ${productId} supprimé avec succès`);
          } else {
            console.warn("⚠️ Aucun productId fourni dans le message");
          }

          channel.ack(msg);
        } catch (error) {
          console.error("❌ Erreur lors du traitement du message :", error.message);
          channel.nack(msg, false, false); // Ne pas réessayer ce message
        }
      }
    });
  } catch (error) {
    console.error("❌ Échec de la connexion à RabbitMQ :", error.message);
  }
}

module.exports = listenForMessages;
