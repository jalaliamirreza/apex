# APEX MVP — Part 3: Backend Implementation

## backend/Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "dev"]
```

## backend/package.json

```json
{
  "name": "apex-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@opensearch-project/opensearch": "^2.5.0",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "minio": "^7.1.3",
    "morgan": "^1.10.0",
    "pg": "^8.11.3",
    "uuid": "^9.0.1",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/morgan": "^1.9.9",
    "@types/node": "^20.10.5",
    "@types/pg": "^8.10.9",
    "@types/uuid": "^9.0.7",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.3.3"
  }
}
```

## backend/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## backend/src/index.ts

```typescript
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
```

## backend/src/config/database.ts

```typescript
import { Pool } from 'pg';

let pool: Pool;

export async function initDatabase(): Promise<void> {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await pool.query('SELECT NOW()');
}

export function getPool(): Pool {
  if (!pool) throw new Error('Database not initialized');
  return pool;
}

export async function query(text: string, params?: any[]) {
  return getPool().query(text, params);
}
```

## backend/src/config/opensearch.ts

```typescript
import { Client } from '@opensearch-project/opensearch';
import { logger } from '../utils/logger';

let client: Client;
const SUBMISSIONS_INDEX = 'apex-submissions';

export async function initOpenSearch(): Promise<void> {
  client = new Client({ node: process.env.OPENSEARCH_URL || 'http://localhost:9200' });
  await client.cluster.health({});
  
  const indexExists = await client.indices.exists({ index: SUBMISSIONS_INDEX });
  if (!indexExists.body) {
    await client.indices.create({
      index: SUBMISSIONS_INDEX,
      body: {
        mappings: {
          properties: {
            formId: { type: 'keyword' },
            formSlug: { type: 'keyword' },
            formName: { type: 'text' },
            dataText: { type: 'text' },
            submittedAt: { type: 'date' }
          }
        }
      }
    });
    logger.info(`Created index: ${SUBMISSIONS_INDEX}`);
  }
}

export function getOpenSearchClient(): Client {
  if (!client) throw new Error('OpenSearch not initialized');
  return client;
}

export { SUBMISSIONS_INDEX };
```

## backend/src/config/minio.ts

```typescript
import { Client } from 'minio';
import { logger } from '../utils/logger';

let minioClient: Client;
const BUCKET_NAME = 'apex-files';

export async function initMinio(): Promise<void> {
  minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'apex',
    secretKey: process.env.MINIO_SECRET_KEY || 'apex_secret'
  });

  const exists = await minioClient.bucketExists(BUCKET_NAME);
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME);
    logger.info(`Created bucket: ${BUCKET_NAME}`);
  }
}

export function getMinioClient(): Client {
  if (!minioClient) throw new Error('MinIO not initialized');
  return minioClient;
}

export { BUCKET_NAME };
```

## backend/src/utils/logger.ts

```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple())
    })
  ]
});
```

## backend/src/utils/slugify.ts

```typescript
export function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}
```

## backend/src/middleware/auth.middleware.ts

```typescript
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: { sub: string; email: string; preferred_username: string; roles: string[] };
}

export function internalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'];
  if (apiKey === process.env.APEX_API_KEY) {
    req.user = { sub: 'internal', email: 'system@apex.local', preferred_username: 'system', roles: ['admin'] };
  }
  next();
}
```

## backend/src/middleware/error.middleware.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction): void {
  logger.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
}
```

## backend/src/models/form.model.ts

```typescript
export interface FormField {
  name: string;
  type: string;
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface FormSchema { components: FormioComponent[]; }

export interface FormioComponent {
  type: string;
  key: string;
  label: string;
  input?: boolean;
  validate?: { required?: boolean };
  data?: { values?: { label: string; value: string }[] };
  placeholder?: string;
}

export interface Form {
  id: string;
  slug: string;
  name: string;
  description?: string;
  schema: FormSchema;
  status: 'active' | 'archived';
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFormInput {
  name: string;
  description?: string;
  fields: FormField[];
}

export function fieldToFormioComponent(field: FormField): FormioComponent {
  const typeMap: Record<string, string> = {
    text: 'textfield', textarea: 'textarea', number: 'number', email: 'email',
    date: 'datetime', select: 'select', checkbox: 'checkbox', file: 'file', signature: 'signature'
  };

  const component: FormioComponent = { type: typeMap[field.type] || 'textfield', key: field.name, label: field.label, input: true };
  if (field.required) component.validate = { required: true };
  if (field.placeholder) component.placeholder = field.placeholder;
  if (field.options?.length) {
    component.data = { values: field.options.map(opt => ({ label: opt, value: opt.toLowerCase().replace(/\s+/g, '_') })) };
  }
  return component;
}
```

## backend/src/models/submission.model.ts

```typescript
export interface Submission {
  id: string;
  formId: string;
  data: Record<string, any>;
  files?: string[];
  submittedBy?: string;
  submittedAt: Date;
}

export interface CreateSubmissionInput {
  data: Record<string, any>;
  files?: string[];
}
```
