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

  // Consommer les messages de la queue 'events'
  rabbitChannel.consume('events', async (msg) => {
    if (msg !== null) {
      try {
        const event = JSON.parse(msg.content.toString());
        rabbitmqConsumeCounter.inc({ event: event.type || 'unknown' });
        if (onEvent) await onEvent(event);
      } catch (err) {
        console.error('[RabbitMQ Consumer] Erreur de parsing ou de traitement:', err);
      } finally {
        rabbitChannel.ack(msg);
      }
    }
  });
  console.log("📥 product-service écoute la file : events");
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