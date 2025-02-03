#!/bin/bash

# Step 1: Remove any existing container named my-backend-container.
echo "Removing existing my-backend-container (if any)..."
docker rm -f my-backend-container 2>/dev/null

# Step 2: Build the Docker image for the back end.
echo "Building the back-end image..."
docker build -t jonatanav255/my-backend:latest .

# Step 3: Push the newly built image to Docker Hub.
echo "Pushing the image to Docker Hub..."
docker push jonatanav255/my-backend:latest

# Step 4: Run a new container from the pushed image with environment variables injected.
echo "Running the new my-backend-container..."
docker run --name my-backend-container -p 8080:8080 --env-file .env -d jonatanav255/my-backend:latest

echo "Done. The back end should be accessible on http://localhost:8080"
