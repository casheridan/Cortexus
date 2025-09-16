import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// Fixed: Added leading slash to the route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'cfx-backend'
    });
});

// TODO: add routes to fetch data from DB

export default app;