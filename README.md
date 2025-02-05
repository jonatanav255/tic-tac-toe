# bash script to build the image and the container

- chmod +x scripts/*.sh
- ./scripts/build_and_run_backend.sh

# bash script to pull and build the container

- chmod +x scripts/*.sh
- ./scripts/pull_and_run_backend.sh

# Script to get into the DB (docker)
- docker exec -it my-postgres-db psql -U jonatanav255 -d myworkdb

##
docker buildx build --platform linux/amd64 -t jonatanav255/my-backend:latest --push .
