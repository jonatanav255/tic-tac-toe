#!/bin/bash

# Print a message to indicate the start of the process.
echo "Pulling the back-end image from Docker Hub..."

# Pull the latest image from Docker Hub.
docker pull jonatanav255/my-backend:latest

# Remove any existing container named my-backend-container (if it exists).
echo "Removing any existing container named my-backend-container (if any)..."
docker rm -f my-backend-container 2>/dev/null

# Run a new container from the pulled image.
# This maps port 8080 on your host to port 8080 in the container.
echo "Running the new my-backend-container..."
docker run --name my-backend-container -p 8080:8080 -d jonatanav255/my-backend:latest

# Final message
echo "Done. The back end should be accessible on http://localhost:8080"
