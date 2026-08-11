import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/api.router';

const app = express();

app.use(cors());
app.use(express.json());

// Mount routes under /api prefix
app.use('/api', apiRouter);

const port = process.env['PORT'] || 3000;

app.listen(port, () => {
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
});
