#!/usr/bin/env bash
set -e

# Resolve project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Ensure local node / npm binaries are in PATH if available
if [ -d "/home/messsam-naqvi/snap/antigravity-cli/common/local/bin" ]; then
    export PATH="/home/messsam-naqvi/snap/antigravity-cli/common/local/bin:$PATH"
fi
export PATH="$HOME/.local/bin:/usr/local/bin:$PATH"

echo "=========================================================="
echo "  Starting Capitas Finance - Broker & Asset Platform"
echo "=========================================================="

# Check if node is installed
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Error: Node.js is not found in PATH."
    echo "Please ensure Node.js (v18+) is installed and accessible."
    exit 1
fi

# Check if npm is installed
if ! command -v npm >/dev/null 2>&1; then
    echo "❌ Error: npm is not found in PATH."
    echo "Please ensure npm is installed and accessible."
    exit 1
fi

echo "✓ Node.js : $(node -v)"
echo "✓ npm     : v$(npm -v)"
echo "✓ Root    : $PROJECT_DIR"

# Check if node_modules exists, install if missing
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 node_modules not found. Running npm install..."
    npm install
fi

echo ""
echo "🚀 Starting Vite development server..."
echo "🌐 Local URL: http://localhost:5173/"
echo "   Press Ctrl+C to stop the application."
echo "=========================================================="
echo ""

exec npm run dev
