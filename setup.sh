#!/bin/bash
# setup.sh — first-time project setup
# Run once after cloning: bash setup.sh

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
RESET='\033[0m'

echo ""
echo -e "${BOLD}${CYAN}Project setup${RESET}"
echo -e "${CYAN}─────────────────────────────────────────────${RESET}"
echo ""

# ── 1. Project name ───────────────────────────────────────────
echo -e "${BOLD}Project name${RESET} (used in CLAUDE.md and package.json)"
read -p "→ " PROJECT_NAME

if [ -z "$PROJECT_NAME" ]; then
  echo -e "${RED}Project name required.${RESET}"
  exit 1
fi

# ── 2. GitHub repo URL (optional) ────────────────────────────
echo ""
echo -e "${BOLD}GitHub repo URL${RESET} (optional — press enter to skip)"
echo -e "${CYAN}  Create at: https://github.com/new${RESET}"
read -p "→ " GITHUB_URL

# ── 3. Supabase credentials ───────────────────────────────────
echo ""
echo -e "${BOLD}Supabase setup${RESET}"
echo ""
echo -e "You'll need a Supabase project. If you don't have one:"
echo -e "  1. Go to ${CYAN}https://app.supabase.com${RESET}"
echo -e "  2. Click ${BOLD}New project${RESET}"
echo -e "  3. Choose a name, region, and password"
echo -e "  4. Wait ~2 minutes for it to provision"
echo -e "  5. Go to ${CYAN}Project Settings → API${RESET}"
echo ""
echo -e "${BOLD}Supabase project URL${RESET}"
echo -e "  Found at: Project Settings → API → Project URL"
echo -e "  Format: https://[ref].supabase.co"
read -p "→ " SUPABASE_URL

echo ""
echo -e "${BOLD}Supabase anon key${RESET}"
echo -e "  Found at: Project Settings → API → anon public"
read -p "→ " SUPABASE_ANON_KEY

# ── 4. Validate inputs ────────────────────────────────────────
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
  echo ""
  echo -e "${YELLOW}Supabase credentials not provided.${RESET}"
  echo -e "You can add them later by editing .env.local"
  echo -e "and running: ${CYAN}pnpm check-env${RESET}"
fi

# ── 5. Write .env.local ───────────────────────────────────────
echo ""
echo -e "${CYAN}Writing .env.local...${RESET}"

cat > .env.local << ENVEOF
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENVEOF

# ── 6. Update CLAUDE.md ───────────────────────────────────────
echo -e "${CYAN}Updating CLAUDE.md...${RESET}"
sed -i.bak "s/\[PROJECT_NAME\]/${PROJECT_NAME}/g" CLAUDE.md
sed -i.bak "s|\[GITHUB_REPO_URL\]|${GITHUB_URL:-not set}|g" CLAUDE.md
sed -i.bak "s|\[SUPABASE_PROJECT_URL\]|${SUPABASE_URL:-not set}|g" CLAUDE.md
rm -f CLAUDE.md.bak

# ── 7. Update package.json name ──────────────────────────────
SLUG=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g')
sed -i.bak "s/\"name\": \"template-repo\"/\"name\": \"${SLUG}\"/g" package.json
rm -f package.json.bak

# ── 8. Install dependencies ───────────────────────────────────
echo -e "${CYAN}Installing dependencies...${RESET}"
pnpm install

# ── 9. Validate environment ───────────────────────────────────
echo -e "${CYAN}Validating environment...${RESET}"
pnpm check-env || true  # non-fatal if keys missing — user may add later

# ── 10. Done ──────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}Setup complete.${RESET}"
echo ""
echo -e "  Project:  ${BOLD}${PROJECT_NAME}${RESET}"
echo -e "  Supabase: ${SUPABASE_URL:-${YELLOW}not set — add to .env.local${RESET}}"
echo ""
echo -e "${BOLD}Next steps:${RESET}"
echo -e "  1. Open this folder in Claude Code"
echo -e "  2. Share your Figma URL — brand tokens extract automatically"
echo -e "  3. Run ${CYAN}pnpm dev${RESET} to start building"
echo ""
echo -e "${BOLD}Supabase setup guide:${RESET}"
echo -e "  Run ${CYAN}pnpm db:types${RESET} after adding your first table to sync types"
echo -e "  Enable Row Level Security on every table (always on by default in migrations)"
echo ""
