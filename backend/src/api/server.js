import express from 'express';
import cors from 'cors';
import { loadMockData, getCfxData } from '../services/mockCfxDataService.js';

const app = express();

app.use(cors());
app.use(express.json());

// Load mock data on startup
loadMockData();

// Fixed: Added leading slash to the route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'cfx-backend'
    });
});

// New endpoint to serve mock CFX data
app.get('/api/cfx-data', (req, res) => {
    const data = getCfxData();
    res.json(data);
});

// TODO: add routes to fetch data from DB

export default app;