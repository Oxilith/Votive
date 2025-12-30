#!/bin/bash
# verify-workspace-setup.sh
# Run this after npm install to verify the workspace migration

set -e

echo "🔍 Verifying npm workspace setup..."

# Check if shared symlink exists in node_modules
if [ -L "node_modules/shared" ]; then
  echo "✅ Shared package symlinked correctly"
  ls -la node_modules/shared
else
  echo "❌ Shared package not symlinked. Run 'npm install' first."
  exit 1
fi

# Build shared first
echo ""
echo "🔨 Building shared package..."
npm run build -w shared

# Verify shared/dist exists
if [ -d "shared/dist" ]; then
  echo "✅ Shared dist folder created"
else
  echo "❌ Shared dist folder not found"
  exit 1
fi

# Build all services
echo ""
echo "🔨 Building all services..."
npm run build -w backend
npm run build -w worker
npm run build -w prompt-service

# Check for incorrect relative imports in dist folders
echo ""
echo "🔍 Checking for incorrect relative imports..."

BAD_IMPORTS=$(grep -r "\.\.\/shared\/src" backend/dist/ worker/dist/ prompt-service/dist/ 2>/dev/null || true)

if [ -n "$BAD_IMPORTS" ]; then
  echo "❌ Found incorrect relative imports to ../shared/src:"
  echo "$BAD_IMPORTS"
  exit 1
fi

echo "✅ No incorrect relative imports found"

# Verify dist structure is flat (not nested)
echo ""
echo "🔍 Verifying dist structure..."

for service in backend worker; do
  if [ -f "$service/dist/index.js" ]; then
    echo "✅ $service/dist/index.js exists (flat structure)"
  elif [ -f "$service/dist/src/index.js" ]; then
    echo "⚠️  $service/dist/src/index.js exists (nested but OK for rootDir: ./src)"
  else
    echo "❌ $service entry point not found"
    exit 1
  fi
done

# Prompt service has nested structure due to rootDir: "."
if [ -f "prompt-service/dist/src/index.js" ]; then
  echo "✅ prompt-service/dist/src/index.js exists"
else
  echo "❌ prompt-service entry point not found"
  exit 1
fi

echo ""
echo "✅ All verification checks passed!"
echo ""
echo "Next steps:"
echo "  1. docker compose build"
echo "  2. docker compose up"
