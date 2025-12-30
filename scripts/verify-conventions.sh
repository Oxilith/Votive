#!/bin/bash

# Votive Codebase Conventions Verification Script
# Ensures codebase follows established patterns

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Track specific error types for dynamic fix suggestions
HAS_JS_IMPORTS=false
HAS_PARENT_IMPORTS=false
HAS_DOCKERFILE_ISSUES=false
HAS_BARREL_ISSUES=false
HAS_REQUIRE_USAGE=false
HAS_PATH_ALIAS_ISSUES=false

# Directories to check
SRC_DIRS=("shared/src" "backend/src" "worker/src" "prompt-service/src" "app/src")
DOCKER_FILES=("backend/Dockerfile" "worker/Dockerfile" "prompt-service/Dockerfile" "app/Dockerfile")
# Packages that need @/* alias (have nested directory structure)
PACKAGES_WITH_ALIAS=("backend" "worker" "prompt-service" "app")
# All packages for other checks
ALL_PACKAGES=("shared" "backend" "worker" "prompt-service" "app")

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}        Votive Codebase Conventions Verification                ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

# ============================================================================
# CHECK 1: No .js extensions in imports
# ============================================================================
echo -e "${BLUE}[1/9] Checking for .js extension imports...${NC}"

JS_IMPORTS=$(grep -rn "from ['\"].*\.js['\"]" --include="*.ts" --include="*.tsx" \
    shared/src backend/src worker/src prompt-service/src app/src 2>/dev/null || true)

if [ -n "$JS_IMPORTS" ]; then
    echo -e "${RED}  ✗ Found .js extension imports:${NC}"
    echo "$JS_IMPORTS" | while read -r line; do
        echo -e "    ${RED}$line${NC}"
    done
    ((ERRORS++))
    HAS_JS_IMPORTS=true
else
    echo -e "${GREEN}  ✓ No .js extension imports found${NC}"
fi

# ============================================================================
# CHECK 2: No parent directory imports (../)
# Note: Same-directory imports (./) are allowed
# ============================================================================
echo ""
echo -e "${BLUE}[2/9] Checking for parent directory imports (../)...${NC}"

PARENT_IMPORTS=$(grep -rn "from ['\"]\.\./" --include="*.ts" --include="*.tsx" \
    shared/src backend/src worker/src prompt-service/src app/src 2>/dev/null \
    | grep -v "\.test\." \
    | grep -v "\.spec\." \
    | grep -v "__tests__" \
    | grep -v "// @allow-relative" \
    || true)

if [ -n "$PARENT_IMPORTS" ]; then
    echo -e "${RED}  ✗ Found parent directory imports (use @/* instead):${NC}"
    echo "$PARENT_IMPORTS" | head -20 | while read -r line; do
        echo -e "    ${RED}$line${NC}"
    done
    COUNT=$(echo "$PARENT_IMPORTS" | wc -l | tr -d ' ')
    if [ "$COUNT" -gt 20 ]; then
        echo -e "    ${YELLOW}... and $((COUNT - 20)) more${NC}"
    fi
    ((ERRORS++))
    HAS_PARENT_IMPORTS=true
else
    echo -e "${GREEN}  ✓ No parent directory imports found${NC}"
fi

# ============================================================================
# CHECK 3: Info about same-directory imports (./) - just informational
# ============================================================================
echo ""
echo -e "${BLUE}[3/9] Checking same-directory imports (./)...${NC}"

SAME_DIR_IMPORTS=$(grep -rn "from ['\"]\./" --include="*.ts" --include="*.tsx" \
    shared/src backend/src worker/src prompt-service/src app/src 2>/dev/null \
    | grep -v "\.test\." \
    | grep -v "\.spec\." \
    | grep -v "__tests__" \
    || true)

if [ -n "$SAME_DIR_IMPORTS" ]; then
    COUNT=$(echo "$SAME_DIR_IMPORTS" | wc -l | tr -d ' ')
    echo -e "${GREEN}  ✓ Found $COUNT same-directory imports (allowed)${NC}"
else
    echo -e "${GREEN}  ✓ No same-directory imports found${NC}"
fi

# ============================================================================
# CHECK 4: Dockerfiles copy tsconfig.base.json
# ============================================================================
echo ""
echo -e "${BLUE}[4/9] Checking Dockerfiles for tsconfig.base.json copy...${NC}"

for dockerfile in "${DOCKER_FILES[@]}"; do
    if [ -f "$dockerfile" ]; then
        if grep -q "COPY tsconfig.base.json" "$dockerfile"; then
            echo -e "${GREEN}  ✓ $dockerfile copies tsconfig.base.json${NC}"
        else
            echo -e "${RED}  ✗ $dockerfile missing: COPY tsconfig.base.json ./${NC}"
            ((ERRORS++))
            HAS_DOCKERFILE_ISSUES=true
        fi
    else
        echo -e "${YELLOW}  ⚠ $dockerfile not found${NC}"
        ((WARNINGS++))
    fi
done

# ============================================================================
# CHECK 5: Dockerfiles copy tsup.config.ts for server packages
# ============================================================================
echo ""
echo -e "${BLUE}[5/9] Checking Dockerfiles for tsup.config.ts copy...${NC}"

TSUP_PACKAGES=("backend" "worker" "prompt-service")

for pkg in "${TSUP_PACKAGES[@]}"; do
    dockerfile="$pkg/Dockerfile"
    
    if [ -f "$dockerfile" ]; then
        # Check for shared tsup.config.ts
        if grep -q "COPY shared/tsup.config.ts" "$dockerfile"; then
            echo -e "${GREEN}  ✓ $dockerfile copies shared/tsup.config.ts${NC}"
        else
            echo -e "${RED}  ✗ $dockerfile missing: COPY shared/tsup.config.ts shared/${NC}"
            ((ERRORS++))
            HAS_DOCKERFILE_ISSUES=true
        fi
        
        # Check for package's own tsup.config.ts
        if grep -q "COPY $pkg/tsup.config.ts" "$dockerfile"; then
            echo -e "${GREEN}  ✓ $dockerfile copies $pkg/tsup.config.ts${NC}"
        else
            echo -e "${RED}  ✗ $dockerfile missing: COPY $pkg/tsup.config.ts $pkg/${NC}"
            ((ERRORS++))
            HAS_DOCKERFILE_ISSUES=true
        fi
    fi
done

# ============================================================================
# CHECK 6: Package tsconfigs extend base (skip app/tsconfig.json - it's refs only)
# ============================================================================
echo ""
echo -e "${BLUE}[6/9] Checking package tsconfigs extend base...${NC}"

for pkg in "${ALL_PACKAGES[@]}"; do
    # Skip app entirely - it uses Vite's default tsconfig structure (standalone is intentional)
    if [ "$pkg" == "app" ]; then
        echo -e "${GREEN}  ✓ app/tsconfig.app.json skipped (Vite default, standalone is intentional)${NC}"
        continue
    fi
    
    tsconfig="$pkg/tsconfig.json"
    
    if [ -f "$tsconfig" ]; then
        if grep -q '"extends".*tsconfig.base.json' "$tsconfig"; then
            echo -e "${GREEN}  ✓ $tsconfig extends tsconfig.base.json${NC}"
        else
            echo -e "${YELLOW}  ⚠ $tsconfig does not extend tsconfig.base.json (standalone)${NC}"
            ((WARNINGS++))
        fi
    fi
done

# ============================================================================
# CHECK 7: Packages with nested dirs have @/* path alias
# Note: shared is flat (no nested dirs), so it doesn't need @/*
# ============================================================================
echo ""
echo -e "${BLUE}[7/9] Checking tsconfigs for @/* path alias...${NC}"

echo -e "${GREEN}  ✓ shared/tsconfig.json skipped (flat structure, no @/* needed)${NC}"

for pkg in "${PACKAGES_WITH_ALIAS[@]}"; do
    # For app, check tsconfig.app.json
    if [ "$pkg" == "app" ]; then
        tsconfig="app/tsconfig.app.json"
    else
        tsconfig="$pkg/tsconfig.json"
    fi
    
    if [ -f "$tsconfig" ]; then
        if grep -q '"@/\*"' "$tsconfig"; then
            echo -e "${GREEN}  ✓ $tsconfig has @/* path alias${NC}"
        else
            echo -e "${RED}  ✗ $tsconfig missing @/* path alias${NC}"
            ((ERRORS++))
            HAS_PATH_ALIAS_ISSUES=true
        fi
    fi
done

# ============================================================================
# CHECK 8: Barrel exports exist in key directories
# ============================================================================
echo ""
echo -e "${BLUE}[8/9] Checking for barrel exports (index.ts) in key directories...${NC}"

# Define directories that should have barrel exports
BARREL_DIRS=(
    "shared/src"
    "backend/src/config"
    "backend/src/services"
    "backend/src/middleware"
    "backend/src/routes"
    "backend/src/utils"
    "worker/src/config"
    "worker/src/jobs"
    "prompt-service/src/config"
    "prompt-service/src/services"
    "prompt-service/src/middleware"
    "prompt-service/src/routes"
    "prompt-service/src/controllers"
    "app/src/components"
    "app/src/hooks"
    "app/src/utils"
    "app/src/services"
)

for dir in "${BARREL_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        if [ -f "$dir/index.ts" ]; then
            echo -e "${GREEN}  ✓ $dir/index.ts exists${NC}"
        else
            # Check if directory has any .ts files (excluding test files)
            TS_FILES=$(find "$dir" -maxdepth 1 -name "*.ts" ! -name "*.test.ts" ! -name "*.spec.ts" 2>/dev/null | wc -l | tr -d ' ')
            if [ "$TS_FILES" -gt 1 ]; then
                echo -e "${YELLOW}  ⚠ $dir has $TS_FILES .ts files but no index.ts barrel export${NC}"
                ((WARNINGS++))
                HAS_BARREL_ISSUES=true
            fi
        fi
    fi
done

# ============================================================================
# CHECK 9: No require() usage
# ============================================================================
echo ""
echo -e "${BLUE}[9/9] Checking for require() usage...${NC}"

REQUIRE_USAGE=$(grep -rn "require(['\"]" --include="*.ts" --include="*.tsx" \
    shared/src backend/src worker/src prompt-service/src app/src 2>/dev/null \
    | grep -v "\.test\." \
    | grep -v "\.spec\." \
    | grep -v "__tests__" \
    | grep -v "// @allow-require" \
    || true)

if [ -n "$REQUIRE_USAGE" ]; then
    echo -e "${RED}  ✗ Found require() usage (use ES imports instead):${NC}"
    echo "$REQUIRE_USAGE" | while read -r line; do
        echo -e "    ${RED}$line${NC}"
    done
    ((ERRORS++))
    HAS_REQUIRE_USAGE=true
else
    echo -e "${GREEN}  ✓ No require() usage found${NC}"
fi

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                          Summary                               ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${BLUE}Import Rules:${NC}"
echo -e "  • Same directory (./)     → ${GREEN}Allowed${NC}"
echo -e "  • Parent directory (../)  → ${RED}Use @/* instead${NC}"
echo -e "  • Cross-package           → ${GREEN}Use package name (e.g., 'shared')${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Codebase follows conventions.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Passed with $WARNINGS warning(s)${NC}"
    echo ""
    if [ "$HAS_BARREL_ISSUES" = true ]; then
        echo -e "${YELLOW}Suggestions:${NC}"
        echo -e "  • Create index.ts barrel exports for directories with multiple files"
    fi
    exit 0
else
    echo -e "${RED}✗ Found $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo ""
    echo -e "${YELLOW}To fix:${NC}"
    if [ "$HAS_PARENT_IMPORTS" = true ]; then
        echo -e "  • Replace '../' imports with '@/' path aliases"
    fi
    if [ "$HAS_JS_IMPORTS" = true ]; then
        echo -e "  • Remove .js extensions from imports"
    fi
    if [ "$HAS_DOCKERFILE_ISSUES" = true ]; then
        echo -e "  • Add missing COPY statements to Dockerfiles (tsconfig.base.json, tsup.config.ts)"
    fi
    if [ "$HAS_PATH_ALIAS_ISSUES" = true ]; then
        echo -e "  • Add @/* path alias to tsconfig.json files"
    fi
    if [ "$HAS_REQUIRE_USAGE" = true ]; then
        echo -e "  • Replace require() with ES import statements"
    fi
    if [ "$HAS_BARREL_ISSUES" = true ]; then
        echo -e "  • Consider creating index.ts barrel exports for directories with multiple files"
    fi
    exit 1
fi
