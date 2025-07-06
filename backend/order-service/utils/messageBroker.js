// order-service/utils/messageBroker.js
const amqp = require('amqplib');

let channel;

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

const publishToQueue = async (queueName, message) => {
  if (!channel) {
    console.error("RabbitMQ channel not initialized");
    return;
  }
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
};

module.exports = {
  connectRabbitMQ,
  publishToQueue,
};
