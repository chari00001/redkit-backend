# Redit - Social Platform

This project consists of a frontend application built with Next.js and multiple microservices for backend functionality including user management, posts, and communities.

## Project Structure

The project is organized into two main directories:

- `redkitfrontend/`: Contains the frontend application
- `monorepo-root/services/`: Contains the backend microservices
  - `user-service/`: User authentication and user management
  - `post-service/`: Handles post creation, updates, and retrieval
  - `community-service/`: Manages communities, memberships, and related functionality

## Getting Started

### Development Setup

#### Running Backend Services

Each service can be run independently:

1. **User Service**:
```bash
cd monorepo-root/services/user-service
npm install
npm run dev
```

2. **Post Service**:
```bash
cd monorepo-root/services/post-service
npm install
npm run dev
```

3. **Community Service**:
```bash
cd monorepo-root/services/community-service
npm install
PORT=3005 npm run dev
```

#### Running Frontend

```bash
cd redkitfrontend
npm install
npm run dev
```

### Docker Setup

For a complete environment with all services, use Docker Compose:

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop all services
docker-compose down
```

## API Endpoints

### User Service (Port 3010)
- Authentication: `/api/auth`
- User management: `/api/users`

### Post Service (Port 3002)
- Post operations: `/api/posts`

### Community Service (Port 3005)
- Community operations: `/api/communities`

## Testing

Each service has its own test script:

```bash
cd monorepo-root/services/user-service
sh test.sh

cd monorepo-root/services/post-service
sh test.sh

cd monorepo-root/services/community-service
sh test.sh
```

## Environment Variables

The application uses the following environment variables:

### Backend Services
- `DB_HOST`: Database hostname (default: "localhost" in dev, "postgres" in Docker)
- `DB_PORT`: Database port (default: 5432)
- `DB_USER`: Database username (default: "postgres")
- `DB_PASSWORD`: Database password (default: "postgres")
- `DB_NAME`: Database name (default: "social_platform")
- `PORT`: Service port (3010 for user, 3002 for post, 3005 for community)
- `NODE_ENV`: Environment mode (development/production)
- `JWT_SECRET`: Secret key for JWT tokens
- `TEST_MODE`: Enable test mode to bypass authentication (true/false)

### Frontend
- `NEXT_PUBLIC_USER_API_URL`: URL for user service API
- `NEXT_PUBLIC_POST_API_URL`: URL for post service API
- `NEXT_PUBLIC_COMMUNITY_API_URL`: URL for community service API

## Troubleshooting

If you encounter issues:

1. Check if the database is running and accessible
2. Verify that all environment variables are set correctly
3. Make sure the ports (3010, 3002, 3005, 3000) are available
4. Check logs for errors:
   ```bash
   docker-compose logs -f [service-name]
   ```

## Test Mode

The backend services support a test mode that bypasses authentication for testing purposes:

```bash
# Enable test mode when starting a service
cd monorepo-root/services/user-service
TEST_MODE=true npm run dev

# Or with node directly
cd monorepo-root/services/community-service
TEST_MODE=true node src/index.js
```

When TEST_MODE is enabled, the services will use a test user with the following credentials:
- ID: 4
- Email: test@test.com
- Role: admin

## JWT Tokens

### Obtaining Tokens

JWT tokens are generated when users register or login through the user service:

1. **Register a new user**:
```bash
curl -X POST http://localhost:3010/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "newuser", "email": "user@example.com", "password": "password123"}'
```

2. **Login with existing credentials**:
```bash
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

Both operations will return a response that includes a JWT token:
```json
{
  "user": {
    "id": 1,
    "username": "newuser",
    "email": "user@example.com",
    ...
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Using Tokens

Include the token in the Authorization header for subsequent API requests:

```bash
curl -X GET http://localhost:3002/api/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

In frontend applications, the token is automatically added to requests by the apiService.js configuration, which retrieves it from localStorage.

For test scripts, a pre-configured test token is included:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzE4NzE5NDkwLCJleHAiOjE4MTg3MTk0OTB9.ND1AxH-6zyZA8eTxUm85mF-0IsrCoUMPMUVGRrThMhw
``` 