#!/bin/sh
set -e

PASSFILE=/var/lib/pgadmin/pgpass
mkdir -p /var/lib/pgadmin
printf '%s\n' "${POSTGRES_HOST:-postgres}:5432:*:${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}" > "$PASSFILE"
chmod 600 "$PASSFILE"

exec /entrypoint.sh "$@"
