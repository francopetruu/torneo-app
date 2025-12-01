#!/bin/bash

# Generate TypeScript types from Supabase schema
# Usage: ./scripts/generate-types.sh [local|remote]

MODE=${1:-local}

if [ "$MODE" = "local" ]; then
  echo "Generating types from local Supabase instance..."
  supabase gen types typescript --local > apps/client/src/types/database.types.ts
  cp apps/client/src/types/database.types.ts apps/admin/src/types/database.types.ts
  echo "Types generated successfully!"
elif [ "$MODE" = "remote" ]; then
  echo "Generating types from remote Supabase project..."
  echo "Make sure you're linked: supabase link --project-ref <project-ref>"
  supabase gen types typescript --linked > apps/client/src/types/database.types.ts
  cp apps/client/src/types/database.types.ts apps/admin/src/types/database.types.ts
  echo "Types generated successfully!"
else
  echo "Usage: ./scripts/generate-types.sh [local|remote]"
  exit 1
fi



