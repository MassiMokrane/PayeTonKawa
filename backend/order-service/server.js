const app = require('./app');
const { connectDB } = require('./config/db');
const { initializeModels } = require('./models');
const { connectAndListenRabbitMQ } = require('./rabbitmq');
const PORT = process.env.PORT || 5002;

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
});

async function startServer() {
  try {
    console.log('DEBUG: Avant connectDB');
    await connectDB();
    console.log('DEBUG: Après connectDB');

    console.log('DEBUG: Avant initializeModels');
    await initializeModels();
    console.log('DEBUG: Après initializeModels');

    console.log('DEBUG: Avant connectAndListenRabbitMQ');
    connectAndListenRabbitMQ(() => {});
    console.log('DEBUG: Après connectAndListenRabbitMQ');

    console.log('DEBUG: Avant app.listen');
    app.listen(PORT, () => {
      console.log(`Order-service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start order-service:', err);
    process.exit(1);
  }
}

startServer(); 