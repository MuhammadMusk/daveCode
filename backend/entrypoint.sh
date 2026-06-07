#!/bin/sh
set -e

python manage.py migrate --noinput
python manage.py collectstatic --noinput || true

if [ "${SEED_DEMO_DATA:-1}" = "1" ]; then
  python manage.py seed_skills || true
fi

exec "$@"
