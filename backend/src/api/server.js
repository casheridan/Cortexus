import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());

app.use(express.json());

app.get('api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});

// TODO: add routs to fetch data from DB

export default app;