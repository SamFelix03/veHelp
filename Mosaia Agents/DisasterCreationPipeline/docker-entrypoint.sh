#!/bin/bash

# Export environment variables from .env file if it exists
if [ -f /app/.env ]; then
    echo "Loading environment variables from .env file..."
    export $(cat /app/.env | grep -v '^#' | xargs)
fi

# Execute the Python application
exec python /app/main.py
