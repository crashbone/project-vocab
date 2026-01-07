#!/bin/bash

# Get connection details via user input
read -p "Enter Admin Username: " ADMIN_USER
read -p "Enter New Database Name: " NEW_DB_NAME
read -p "Enter Host (e.g., localhost): " HOST
read -p "Enter Port (e.g., 5432): " PORT

# Detect OS and set psql path
if [[ "$OSTYPE" == "darwin"* ]]; then
    PSQL_PATH="/Library/PostgreSQL/18/bin/psql"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    PSQL_PATH="/usr/bin/psql"
else
    echo "Unsupported OS: $OSTYPE"
    exit 1
fi

echo "======================================================"
echo "PostgreSQL Database Creation Script"
echo "======================================================"
echo "Attempting to create database: $NEW_DB_NAME"
echo "Connecting via: $PSQL_PATH"
echo ""

"$PSQL_PATH" -h "$HOST" -p "$PORT" -U "$ADMIN_USER" -d "postgres" \
    -c "CREATE DATABASE \"$NEW_DB_NAME\" OWNER = $ADMIN_USER;"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Database '$NEW_DB_NAME' created and owned by '$ADMIN_USER'."
else
    echo ""
    echo "❌ Error: Database creation failed."
    echo "Check:"
    echo "  1. PostgreSQL server is running."
    echo "  2. The password for '$ADMIN_USER'."
    echo "  3. Database '$NEW_DB_NAME' does not already exist."
fi

echo "======================================================"