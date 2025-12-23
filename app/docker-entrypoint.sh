#!/bin/sh
set -e

SSL_CERT="/etc/nginx/ssl/localhost+2.pem"
SSL_KEY="/etc/nginx/ssl/localhost+2-key.pem"

# Generate self-signed certificates if they don't exist
if [ ! -f "$SSL_CERT" ] || [ ! -f "$SSL_KEY" ]; then
    echo "SSL certificates not found, generating self-signed certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$SSL_KEY" \
        -out "$SSL_CERT" \
        -subj "/CN=localhost" \
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
    echo "Self-signed certificates generated successfully"
fi

# Execute the main command
exec "$@"
