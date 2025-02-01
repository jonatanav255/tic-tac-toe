# ======= STAGE 1: Build the Back End =======
FROM node:18 AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your source code into the container
COPY . .

# Build the project (this compiles TypeScript into JavaScript in the "dist" folder)
RUN npm run build

# ======= STAGE 2: Run the Back End =======
FROM node:18-alpine

WORKDIR /app

# Copy the compiled output from the builder stage
COPY --from=builder /app/dist ./

# Copy package files so we can install dependencies in this stage
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Expose the port your server listens on (change 8080 if needed)
EXPOSE 8080

# Run the application (adjust the command if your entry file has a different name)
CMD ["node", "server.js"]
