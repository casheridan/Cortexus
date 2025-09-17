const amqp = require('amqplib');
const fs = require('fs').promises;
const path = require('path');

const MOCK_DATA_DIR = path.join(__dirname, '../mock');
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'cfx_messages';

async function publishMockData() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    const files = await fs.readdir(MOCK_DATA_DIR);

    for (const file of files) {
      if (path.extname(file) === '.json') {
        const filePath = path.join(MOCK_DATA_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        channel.sendToQueue(QUEUE_NAME, Buffer.from(content), {
          persistent: true,
          contentType: 'application/json'
        });
        console.log(`[x] Sent ${file}`);
      }
    }

    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error('Error publishing mock data:', error);
  }
}

publishMockData();

module.exports = { publishMockData };
