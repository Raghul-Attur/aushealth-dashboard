#!/bin/bash

# AusHealth Dashboard — directory scaffold
# Run from the project root, after `pnpm create next-app` has completed.

set -e  # Exit on error

echo "Scaffolding AusHealth dashboard structure..."

# Clean out the default Next.js app folder contents (we're replacing them)
# Be careful: this only touches src/app, nothing else
rm -rf src/app/page.tsx src/app/page.module.css 2>/dev/null || true

# === Directories ===
mkdir -p src/app/\(dashboard\)/overview
mkdir -p src/app/\(dashboard\)/financial
mkdir -p src/app/\(dashboard\)/customer
mkdir -p src/app/\(dashboard\)/operational
mkdir -p src/app/api/data

mkdir -p src/components/shell
mkdir -p src/components/kpi
mkdir -p src/components/charts/primitives
mkdir -p src/components/data-table
mkdir -p src/components/ui
mkdir -p src/components/layout

mkdir -p src/lib/data
mkdir -p src/hooks
mkdir -p src/stores
mkdir -p src/types

# === Files ===
# App shell
touch src/app/\(dashboard\)/layout.tsx
touch src/app/\(dashboard\)/page.tsx
touch src/app/\(dashboard\)/overview/page.tsx
touch src/app/\(dashboard\)/financial/page.tsx
touch src/app/\(dashboard\)/customer/page.tsx
touch src/app/\(dashboard\)/operational/page.tsx
touch src/app/api/data/route.ts
touch src/app/providers.tsx

# Shell components
touch src/components/shell/app-bar.tsx
touch src/components/shell/filter-bar.tsx
touch src/components/shell/tab-strip.tsx
touch src/components/shell/footer.tsx

# KPI components
touch src/components/kpi/kpi-tile.tsx
touch src/components/kpi/kpi-hero.tsx
touch src/components/kpi/delta.tsx
touch src/components/kpi/sparkline.tsx

# Chart components
touch src/components/charts/bullet-chart.tsx
touch src/components/charts/waterfall.tsx
touch src/components/charts/layered-area.tsx
touch src/components/charts/population-pyramid.tsx
touch src/components/charts/sankey.tsx
touch src/components/charts/treemap.tsx
touch src/components/charts/heatmap.tsx
touch src/components/charts/connected-scatter.tsx

# Chart primitives
touch src/components/charts/primitives/axis.tsx
touch src/components/charts/primitives/grid.tsx
touch src/components/charts/primitives/annotation.tsx
touch src/components/charts/primitives/tooltip.tsx

# Data table
touch src/components/data-table/data-table.tsx

# Layout primitives
touch src/components/layout/card.tsx
touch src/components/layout/section-header.tsx
touch src/components/layout/watch-list-card.tsx

# Lib
touch src/lib/utils.ts
touch src/lib/format.ts
touch src/lib/chart-config.ts
touch src/lib/data/parse-apra.ts
touch src/lib/data/schemas.ts
touch src/lib/data/transforms.ts

# Hooks
touch src/hooks/use-filters.ts
touch src/hooks/use-dashboard-data.ts

# Stores
touch src/stores/ui-store.ts

# Types
touch src/types/data.ts

echo "✓ Scaffold complete. Empty files ready to be filled in."
echo ""
echo "Next: paste the contents from the setup guide into:"
echo "  - src/app/globals.css (already exists, just replace contents)"
echo "  - src/app/layout.tsx (already exists, just replace contents)"
echo "  - src/app/providers.tsx"
echo "  - src/lib/utils.ts"
echo "  - src/lib/format.ts"
echo "  - src/components/shell/* (all four files)"
echo "  - src/app/(dashboard)/layout.tsx"
echo "  - src/app/(dashboard)/page.tsx"
echo "  - src/app/(dashboard)/{overview,financial,customer,operational}/page.tsx"