#!/usr/bin/env bash

set -euo pipefail

readonly script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly migrations_dir="${MIGRATIONS_DIR:-$script_dir/migrations}"
readonly database_url="${SUPABASE_DB_URL:-${DATABASE_URL:-}}"

usage() {
  cat <<'EOF'
Usage:
  supabase/apply-migrations.sh
  supabase/apply-migrations.sh --status
  supabase/apply-migrations.sh --mark-applied <version> [<version>...]

Set SUPABASE_DB_URL or DATABASE_URL to a PostgreSQL connection string before running this command.
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ -z "$database_url" ]]; then
  usage >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "[MIGRATIONS] ERROR: psql is not installed." >&2
  exit 1
fi

if [[ ! -d "$migrations_dir" ]]; then
  echo "[MIGRATIONS] ERROR: migrations directory not found: $migrations_dir" >&2
  exit 1
fi

psql "$database_url" -v ON_ERROR_STOP=1 <<'SQL'
CREATE SCHEMA IF NOT EXISTS travel_expenses;
CREATE TABLE IF NOT EXISTS travel_expenses.schema_migrations (
  version TEXT PRIMARY KEY,
  checksum TEXT NOT NULL,
  description TEXT NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
SQL

find_migration() {
  local version="$1"
  local matches=("$migrations_dir"/"$version"_*.sql)

  if [[ ! "$version" =~ ^[0-9]+$ ]]; then
    echo "[MIGRATIONS] ERROR: migration versions must contain only digits." >&2
    exit 1
  fi

  if [[ ${#matches[@]} -ne 1 || ! -f "${matches[0]}" ]]; then
    echo "[MIGRATIONS] ERROR: no migration found for version $version." >&2
    exit 1
  fi

  printf '%s\n' "${matches[0]}"
}

get_checksum() {
  shasum -a 256 "$1" | awk '{print $1}'
}

get_recorded_checksum() {
  local version="$1"
  psql "$database_url" -At -c \
    "SELECT checksum FROM travel_expenses.schema_migrations WHERE version = '$version';"
}

record_baseline() {
  local migration_file="$1"
  local filename version description checksum recorded_checksum
  filename="$(basename "$migration_file")"
  version="${filename%%_*}"
  description="${filename#*_}"
  description="${description%.sql}"
  checksum="$(get_checksum "$migration_file")"
  recorded_checksum="$(get_recorded_checksum "$version")"

  if [[ -n "$recorded_checksum" && "$recorded_checksum" != "$checksum" ]]; then
    echo "[MIGRATIONS] ERROR: checksum mismatch for $filename." >&2
    exit 1
  fi

  psql "$database_url" -v ON_ERROR_STOP=1 \
    -v version="$version" \
    -v checksum="$checksum" \
    -v description="$description" <<'SQL'
INSERT INTO travel_expenses.schema_migrations (version, checksum, description)
VALUES (:'version', :'checksum', :'description')
ON CONFLICT (version) DO NOTHING;
SQL
}

case "${1:-}" in
  --status)
    psql "$database_url" -P pager=off -c \
      "SELECT version, description, checksum, applied_at FROM travel_expenses.schema_migrations ORDER BY version;"
    exit 0
    ;;
  --mark-applied)
    shift
    if [[ $# -eq 0 ]]; then
      usage >&2
      exit 1
    fi

    for version in "$@"; do
      record_baseline "$(find_migration "$version")"
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

shopt -s nullglob
migration_files=("$migrations_dir"/*.sql)

if [[ ${#migration_files[@]} -eq 0 ]]; then
  echo "[MIGRATIONS] No migrations found in $migrations_dir."
  exit 0
fi

existing_schema="$(psql "$database_url" -At -c "SELECT to_regclass('travel_expenses.trips') IS NOT NULL;")"
applied_count="$(psql "$database_url" -At -c "SELECT count(*) FROM travel_expenses.schema_migrations;")"

if [[ "$existing_schema" == "t" && "$applied_count" == "0" ]]; then
  echo "[MIGRATIONS] ERROR: existing travel_expenses schema has no migration history." >&2
  echo "[MIGRATIONS] Verify the current schema, then use --mark-applied to establish its baseline." >&2
  exit 1
fi

sorted_files=()
while IFS= read -r file; do
  sorted_files+=("$file")
done < <(printf '%s\n' "${migration_files[@]}" | sort -V)

for migration_file in "${sorted_files[@]}"; do
  filename="$(basename "$migration_file")"
  version="${filename%%_*}"
  description="${filename#*_}"
  description="${description%.sql}"
  checksum="$(get_checksum "$migration_file")"
  recorded_checksum="$(get_recorded_checksum "$version")"

  if [[ -n "$recorded_checksum" ]]; then
    if [[ "$recorded_checksum" != "$checksum" ]]; then
      echo "[MIGRATIONS] ERROR: checksum mismatch for $filename." >&2
      exit 1
    fi
    echo "[MIGRATIONS] Skipping $filename (already applied)."
    continue
  fi

  transaction_file="$(mktemp)"
  trap 'rm -f "$transaction_file"' EXIT
  {
    printf 'BEGIN;\n'
    cat "$migration_file"
    cat <<'SQL'

INSERT INTO travel_expenses.schema_migrations (version, checksum, description)
VALUES (:'version', :'checksum', :'description');
COMMIT;
SQL
  } >"$transaction_file"

  echo "[MIGRATIONS] Applying $filename"
  psql "$database_url" -v ON_ERROR_STOP=1 \
    -v version="$version" \
    -v checksum="$checksum" \
    -v description="$description" \
    -f "$transaction_file"
  rm -f "$transaction_file"
  trap - EXIT
  echo "[MIGRATIONS] Applied $filename"
done
