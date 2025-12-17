# APEX MVP — Part 2: Docker & Infrastructure

## docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: apex-postgres
    environment:
      POSTGRES_DB: apex
      POSTGRES_USER: apex
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-apex_secret}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U apex -d apex"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - apex-network

  opensearch:
    image: opensearchproject/opensearch:2.11.0
    container_name: apex-opensearch
    environment:
      - discovery.type=single-node
      - plugins.security.disabled=true
      - "OPENSEARCH_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - opensearch_data:/usr/share/opensearch/data
    ports:
      - "9200:9200"
    healthcheck:
      test: ["CMD-SHELL", "curl -sf http://localhost:9200/_cluster/health || exit 1"]
      interval: 10s
      timeout: 10s
      retries: 10
    networks:
      - apex-network

  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    container_name: apex-keycloak
    command: start-dev --import-realm
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_PASSWORD:-admin}
    volumes:
      - ./keycloak/realm-export.json:/opt/keycloak/data/import/realm-export.json
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - apex-network

  minio:
    image: minio/minio:latest
    container_name: apex-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_USER:-apex}
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD:-apex_secret}
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    networks:
      - apex-network

  backend:
    build: ./backend
    container_name: apex-backend
    environment:
      NODE_ENV: development
      PORT: 3001
      DATABASE_URL: postgres://apex:${POSTGRES_PASSWORD:-apex_secret}@postgres:5432/apex
      OPENSEARCH_URL: http://opensearch:9200
      KEYCLOAK_URL: http://keycloak:8080
      KEYCLOAK_REALM: apex
      MINIO_ENDPOINT: minio
      MINIO_PORT: 9000
      MINIO_USE_SSL: "false"
      MINIO_ACCESS_KEY: ${MINIO_USER:-apex}
      MINIO_SECRET_KEY: ${MINIO_PASSWORD:-apex_secret}
      APEX_API_KEY: ${APEX_API_KEY:-apex-internal-key}
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      opensearch:
        condition: service_healthy
    networks:
      - apex-network

  frontend:
    build: ./frontend
    container_name: apex-frontend
    environment:
      VITE_API_URL: http://localhost:3001/api/v1
      VITE_KEYCLOAK_URL: http://localhost:8080
      VITE_KEYCLOAK_REALM: apex
      VITE_KEYCLOAK_CLIENT_ID: apex-frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - apex-network

  mcp-server:
    build: ./mcp-server
    container_name: apex-mcp
    environment:
      APEX_API_URL: http://backend:3001/api/v1
      APEX_API_KEY: ${APEX_API_KEY:-apex-internal-key}
    ports:
      - "3002:3002"
    depends_on:
      - backend
    networks:
      - apex-network

networks:
  apex-network:
    driver: bridge

volumes:
  postgres_data:
  opensearch_data:
  minio_data:
```

---

## .env.example

```env
POSTGRES_PASSWORD=apex_secret_change_me
KEYCLOAK_PASSWORD=admin_change_me
MINIO_USER=apex
MINIO_PASSWORD=apex_secret_change_me
APEX_API_KEY=apex-internal-key-change-me
```

---

## .gitignore

```
node_modules/
dist/
.env
*.log
.DS_Store
```

---

## Database Schema (backend/init.sql)

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    schema JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    files JSONB DEFAULT '[]',
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_forms_slug ON forms(slug);
CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);
CREATE INDEX IF NOT EXISTS idx_submissions_form_id ON submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_forms_updated_at ON forms;
CREATE TRIGGER update_forms_updated_at
    BEFORE UPDATE ON forms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## Keycloak Config (keycloak/realm-export.json)

```json
{
  "realm": "apex",
  "enabled": true,
  "sslRequired": "external",
  "roles": {
    "realm": [
      { "name": "admin", "description": "Administrator" },
      { "name": "user", "description": "User" }
    ]
  },
  "clients": [
    {
      "clientId": "apex-frontend",
      "enabled": true,
      "publicClient": true,
      "redirectUris": ["http://localhost:3000/*"],
      "webOrigins": ["http://localhost:3000"],
      "standardFlowEnabled": true,
      "directAccessGrantsEnabled": true
    },
    {
      "clientId": "apex-backend",
      "enabled": true,
      "publicClient": false,
      "secret": "apex-backend-secret",
      "serviceAccountsEnabled": true
    }
  ],
  "users": [
    {
      "username": "admin",
      "email": "admin@apex.local",
      "enabled": true,
      "emailVerified": true,
      "credentials": [{ "type": "password", "value": "admin123", "temporary": false }],
      "realmRoles": ["admin", "user"]
    },
    {
      "username": "user",
      "email": "user@apex.local",
      "enabled": true,
      "emailVerified": true,
      "credentials": [{ "type": "password", "value": "user123", "temporary": false }],
      "realmRoles": ["user"]
    }
  ]
}
```
