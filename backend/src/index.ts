import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { initDatabase } from './config/database';
import { initOpenSearch } from './config/opensearch';
import { initMinio } from './config/minio';
import routes from './routes';
import { errorMiddleware } from './middleware/error.middleware';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));
app.use('/api/v1', routes);
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use(errorMiddleware);

async function start() {
  try {
    await initDatabase();
    logger.info('Database connected');
    await initOpenSearch();
    logger.info('OpenSearch connected');
    await initMinio();
    logger.info('MinIO connected');
    app.listen(PORT, () => logger.info(`Server on port ${PORT}`));
  } catch (error) {
    logger.error('Failed to start:', error);
    process.exit(1);
  }
}

start();
