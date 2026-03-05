#!/bin/bash

# ==============================================================================
# RealFrontIO: Turborepo Monorepo Migration Script
# ==============================================================================
# This script safely moves existing codebase files into their new monorepo 
# packages using `git mv` to ensure that ALL commit history and `git blame` 
# data is preserved for your developers.
# ==============================================================================

echo "[REALFRONT] Initiating Turborepo Migration..."

# 1. Create target directories
mkdir -p apps/client/src
mkdir -p apps/server/src
mkdir -p apps/capsule
mkdir -p packages/core/src

# 2. Move Rust Capsule -> apps/capsule
echo "[1/4] Migrating Rust Capsule..."
git mv capsule/* apps/capsule/ 2>/dev/null
git mv capsule/.env.example apps/capsule/ 2>/dev/null

# 3. Move Shared Game Engine Logic -> packages/core
echo "[2/4] Migrating Core Engine..."
git mv src/core/* packages/core/src/ 2>/dev/null

# 4. Move WebGL Client -> apps/client
echo "[3/4] Migrating PIXI.js Client..."
git mv src/client/* apps/client/src/ 2>/dev/null
git mv client/.env.example apps/client/ 2>/dev/null

# 5. Move Node.js Server -> apps/server
echo "[4/4] Migrating Node.js Game Server..."
git mv src/server/* apps/server/src/ 2>/dev/null
git mv server/.env.example apps/server/ 2>/dev/null

# 6. Cleanup empty legacy directories
echo "[CLEANUP] Removing legacy directories..."
rm -rf capsule client server src

echo ""
echo "=============================================================================="
echo "MIGRATION COMPLETE! 🚀"
echo "Next steps:"
echo "1. Run: npm install"
echo "2. Run: npm run dev"
echo "This will use Turborepo to boot the client, server, and capsule concurrently."
echo "=============================================================================="
