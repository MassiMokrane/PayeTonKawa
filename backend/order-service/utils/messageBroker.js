// order-service/utils/messageBroker.js
const amqp = require('amqplib');
const client = require('prom-client');

let channel;

// Compteur Prometheus pour les messages publiés par file et par événement
const rabbitmqPublishCounter = new client.Counter({
  name: 'rabbitmq_messages_published_total',
  help: 'Nombre de messages publiés sur RabbitMQ par file et par événement',
  labelNames: ['queue', 'event']
});

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect("amqp://admin:password@rabbitmq");
    channel = await connection.createChannel();
    await channel.assertQueue("product-queue", { durable: true });
    console.log("✅ Connected to RabbitMQ from order-service");
  } catch (error) {
    console.error("❌ RabbitMQ connection error (order-service):", error);
  }
};

const publishToQueue = async (queueName, message, event = 'unknown') => {
  if (!channel) {
    console.error("RabbitMQ channel not initialized");
    return;
  }
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
  rabbitmqPublishCounter.inc({ queue: queueName, event });
};

module.exports = {
  connectRabbitMQ,
  // publishToQueue supprimé car inutilisé
};
