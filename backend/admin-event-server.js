const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:password@rabbitmq';
const QUEUE = 'events';

async function start() {
  try {
    const conn = await amqp.connect(RABBITMQ_URL);
    const channel = await conn.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });
    console.log(`[admin-event-server] Waiting for messages in ${QUEUE}...`);
    channel.consume(QUEUE, (msg) => {
      if (msg !== null) {
        console.log(`[admin-event-server] Event received: ${msg.content.toString()}`);
        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error('[admin-event-server] Error:', err);
    process.exit(1);
  }
}

start(); 