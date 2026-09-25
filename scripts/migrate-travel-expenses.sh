#!/usr/bin/env bash

set -euo pipefail

readonly migration_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../database/migrations/travel_expenses" && pwd)"
readonly database_url="${TRAVEL_EXPENSES_DATABASE_URL:-}"

usage() {
  cat <<'EOF'
Usage:
  scripts/migrate-travel-expenses.sh
  scripts/migrate-travel-expenses.sh --status
  scripts/migrate-travel-expenses.sh --mark-applied <version> [<version>...]

Set TRAVEL_EXPENSES_DATABASE_URL to a PostgreSQL connection string before running this command.
EOF
}

if [[ -z "$database_url" ]]; then
  echo "TRAVEL_EXPENSES_DATABASE_URL is required." >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is required to run migrations." >&2
  exit 1
fi

psql "$database_url" -v ON_ERROR_STOP=1 <<'SQL'
CREATE SCHEMA IF NOT EXISTS travel_expenses;
CREATE TABLE IF NOT EXISTS travel_expenses.schema_migrations (
  version TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  checksum TEXT NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);
SQL

find_migration() {
  local version="$1"
  local matches=("$migration_dir"/"$version"_*.sql)

  if [[ ${#matches[@]} -ne 1 || ! -f "${matches[0]}" ]]; then
    echo "No migration file found for version $version." >&2
    exit 1
  fi

  printf '%s\n' "${matches[0]}"
}

record_migration() {
  local migration_file="$1"
  local version name checksum
  version="$(basename "$migration_file" | cut -d_ -f1)"
  name="$(basename "$migration_file" .sql)"
  checksum="$(shasum -a 256 "$migration_file" | awk '{print $1}')"

  psql "$database_url" -v ON_ERROR_STOP=1 \
    -v version="$version" \
    -v name="$name" \
    -v checksum="$checksum" <<'SQL'
INSERT INTO travel_expenses.schema_migrations (version, name, checksum)
VALUES (:'version', :'name', :'checksum')
ON CONFLICT (version) DO NOTHING;
SQL
}

case "${1:-}" in
  --status)
    psql "$database_url" -P pager=off -c \
      "SELECT version, name, checksum, applied_at FROM travel_expenses.schema_migrations ORDER BY version;"
    exit 0
    ;;
  --mark-applied)
    shift
    if [[ $# -eq 0 ]]; then
      usage >&2
      exit 1
    fi

    for version in "$@"; do
      record_migration "$(find_migration "$version")"
    done
    exit 0
    ;;
  -h|--help)
    usage
    exit 0
    ;;
  "")
    ;;
  *)
    usage >&2
    exit 1
    ;;
esac

existing_schema="$(psql "$database_url" -At -c "SELECT to_regclass('travel_expenses.trips') IS NOT NULL;")"
applied_count="$(psql "$database_url" -At -c "SELECT count(*) FROM travel_expenses.schema_migrations;")"

if [[ "$existing_schema" == "t" && "$applied_count" == "0" ]]; then
  echo "Existing travel_expenses schema has no migration history." >&2
  echo "Verify its state, then use --mark-applied to establish a baseline." >&2
  exit 1
fi

for migration_file in "$migration_dir"/*.sql; do
  [[ -f "$migration_file" ]] || continue

  version="$(basename "$migration_file" | cut -d_ -f1)"
  name="$(basename "$migration_file" .sql)"
  checksum="$(shasum -a 256 "$migration_file" | awk '{print $1}')"
  recorded_checksum="$(psql "$database_url" -At -c \
    "SELECT checksum FROM travel_expenses.schema_migrations WHERE version = '$version';")"

  if [[ -n "$recorded_checksum" ]]; then
    if [[ "$recorded_checksum" != "$checksum" ]]; then
      echo "Migration $version has changed after being applied. Create a new migration instead." >&2
      exit 1
    fi
    continue
  fi

  echo "Applying $name"
  psql "$database_url" -v ON_ERROR_STOP=1 \
    -v migration_file="$migration_file" \
    -v version="$version" \
    -v name="$name" \
    -v checksum="$checksum" <<'SQL'
BEGIN;
\i :migration_file
INSERT INTO travel_expenses.schema_migrations (version, name, checksum)
VALUES (:'version', :'name', :'checksum');
COMMIT;
SQL
done
