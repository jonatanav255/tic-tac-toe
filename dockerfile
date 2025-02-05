# ======= STAGE 1: Build =======
FROM node:18 AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your source code
COPY . .

# Build the project (compiles TypeScript into "dist/")
RUN npm run build

# ======= STAGE 2: Run =======
FROM node:18-alpine

WORKDIR /app

# Copy the dist folder from the builder
COPY --from=builder /app/dist ./

# Copy the production dependencies only
COPY package*.json ./
RUN npm install --production

# Copy the AWS RDS SSL certificate file
COPY us-east-1-bundle.pem /app/us-east-1-bundle.pem

# Optionally set default environment variables here:
# ENV PG_SSL_CA_PATH=/app/us-east-1-bundle.pem
# ENV PGSSLMODE=require

# Expose the port your app listens on (adjust if needed)
EXPOSE 8080

# Start your server
CMD ["node", "server.js"]
