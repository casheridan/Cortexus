import amqp from 'amqplib';
import 'dotenv/config';

const rabbitmqUrl = process.env.RABBITMQ_URL;
const queueName = 'data_processing_queue';

export async function startConsumer() {
    console.log('Attempting to connect to RabbitMQ... ');
    
    try {
        const conn = await amqp.connect(rabbitmqUrl);
        const chan = await conn.createChannel();

        await chan.assertQueue(queueName, { durable: true});

        console.log(`[x] Connected to RabbitMQ. Waiting for messages in "${queueName}"`);

        chan.consume(queueName, (msg) => {
            if (msg !== null) {
                try {
                    const messageContent = msg.content.toString();
                    const parsedData = JSON.parse(messageContent);
                    
                    console.log('[✔] Recieved Data: ', parsedData);

                    // TODO: save parsedData to DB (InfluxDB or PostgreSQL)
                    
                    chan.ack(msg);
                } catch (error) {
                    console.error("Error processing message: ", error);
                    chan.ack(msg);
                }
            }
        });
    } catch (error) {
        console.error(`[X] Failed to connect to RabbitMQ: ${error.message}`);
    }
}