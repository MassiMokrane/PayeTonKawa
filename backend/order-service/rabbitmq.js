const amqp = require('amqplib');
const client = require('prom-client');

let rabbitmqPublishCounter = client.register.getSingleMetric('rabbitmq_messages_published_total');
if (!rabbitmqPublishCounter) {
  rabbitmqPublishCounter = new client.Counter({
    name: "rabbitmq_messages_published_total",
    help: "Nombre de messages publiés sur RabbitMQ par événement",
    labelNames: ["event"],
  });
}

let rabbitmqConsumeCounter = client.register.getSingleMetric('rabbitmq_messages_consumed_total');
if (!rabbitmqConsumeCounter) {
  rabbitmqConsumeCounter = new client.Counter({
    name: "rabbitmq_messages_consumed_total",
    help: "Nombre de messages consommés sur RabbitMQ par événement",
    labelNames: ["event"],
  });
}

let rabbitChannel;

const connectAndListenRabbitMQ = async (onEvent) => {
  const connection = await amqp.connect('amqp://admin:password@rabbitmq');
  rabbitChannel = await connection.createChannel();
  await rabbitChannel.assertQueue('events', { durable: true });

  // Ce service ne consomme plus la queue 'events', il ne fait que publier.
  console.log("📥 order-service prêt à publier sur la file : events");
};

const publishEvent = (type, data) => {
  console.log('[DEBUG publishEvent] Tentative de publication', type, data);
  if (!rabbitChannel) {
    console.error("RabbitMQ channel not initialized");
    return;
  }
  rabbitmqPublishCounter.inc({ event: type || "unknown" });
  rabbitChannel.sendToQueue('events', Buffer.from(JSON.stringify({ type, data })), { persistent: true });
  console.log(`📤 Event publié : ${type}`);
};

// Exporter les métriques pour qu'elles soient visibles dans /metrics
module.exports = { 
  connectAndListenRabbitMQ, 
  publishEvent,
  rabbitmqPublishCounter,
  rabbitmqConsumeCounter
}; 