FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create .env file
RUN echo "DB_NAME=social_platform" > .env && \
    echo "DB_USER=postgres" >> .env && \
    echo "DB_PASSWORD=postgres" >> .env && \
    echo "DB_HOST=postgres" >> .env && \
    echo "DB_PORT=5432" >> .env && \
    echo "PORT=3001" >> .env && \
    echo "NODE_ENV=production" >> .env && \
    echo "JWT_SECRET=your-secret-key" >> .env

# Expose port
EXPOSE 3001

# Start the service
CMD ["node", "src/index.js"] 