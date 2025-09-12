import 'dotenv/config';
import app from './src/api/server.js';
import { startConsumer } from './src/services/rabbitmqConsumer.js';

const PORT = process.env.PORT || 3001;

startConsumer();

app.listen(PORT, () => {
    console.log(`[🚀] API Server is running on http://localhost:${PORT}`);
})