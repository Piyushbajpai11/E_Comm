#!/bin/sh
set -e

echo "Waiting for MongoDB to be ready..."
# Simple retry loop to wait for MongoDB
RETRIES=30
until nc -z mongo 27017 || [ $RETRIES -eq 0 ]; do
  echo "MongoDB is unavailable - sleeping ($RETRIES retries left)"
  RETRIES=$((RETRIES-1))
  sleep 2
done

if [ $RETRIES -eq 0 ]; then
  echo "MongoDB did not become available in time"
  exit 1
fi

echo "MongoDB is ready!"
echo "Running database seed..."
node seed.js

echo "Starting server..."
exec node index.js

