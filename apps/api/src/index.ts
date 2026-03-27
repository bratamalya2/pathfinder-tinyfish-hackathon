import express, { Request, Response } from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import { initDatabase } from './config/database';
import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json());

// Initialize external connections
initDatabase();

// Setup API Routes
app.use('/api', routes);

// Basic health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'PathFinder API is running' });
});

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
});
