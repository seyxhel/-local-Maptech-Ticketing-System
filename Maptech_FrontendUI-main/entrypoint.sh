#!/bin/sh
set -e

# Provide defaults if not set
: "${BACKEND_HOST:=backend}"
: "${BACKEND_PORT:=8000}"

# Substitute environment variables in nginx config template
envsubst '${BACKEND_HOST} ${BACKEND_PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec "$@"
