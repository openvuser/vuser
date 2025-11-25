#!/bin/bash

# Chrome Extension Build Script
# This script creates a zip file of the Chrome extension for distribution

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔨 Building Chrome Extension...${NC}"

# Configuration
EXTENSION_NAME="vuser-chrome-extension"
BUILD_DIR="dist"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ZIP_NAME="${EXTENSION_NAME}_${TIMESTAMP}.zip"

# Files and directories to include in the extension
INCLUDE_FILES=(
    "manifest.json"
    "background.js"
    "content.js"
    "test.html"
    "test.js"
    "icons/"
    "popup/"
)

# Files and directories to exclude
EXCLUDE_PATTERNS=(
    "*.DS_Store"
    "node_modules/"
    "build/"
    "dist/"
    "tests/"
    "*.md"
    "package.json"
    "package-lock.json"
    ".git"
)

# Create dist directory if it doesn't exist
echo -e "${BLUE}📁 Creating dist directory...${NC}"
mkdir -p "$BUILD_DIR"

# Create a temporary directory for staging
TEMP_DIR=$(mktemp -d)
echo -e "${BLUE}📦 Staging files in temporary directory...${NC}"

# Copy files to temporary directory
for item in "${INCLUDE_FILES[@]}"; do
    # Remove trailing slash if present to preserve directory structure
    item_clean="${item%/}"
    
    if [ -e "$item_clean" ]; then
        if [ -d "$item_clean" ]; then
            echo "  - Copying directory: $item_clean"
            cp -r "$item_clean" "$TEMP_DIR/"
        else
            echo "  - Copying file: $item_clean"
            cp "$item_clean" "$TEMP_DIR/"
        fi
    else
        echo -e "${RED}⚠️  Warning: $item_clean not found${NC}"
    fi
done

# Remove excluded files from temp directory
echo -e "${BLUE}🧹 Cleaning up excluded files...${NC}"
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    find "$TEMP_DIR" -name "$pattern" -exec rm -rf {} + 2>/dev/null || true
done

# Create the zip file
echo -e "${BLUE}🗜️  Creating zip file: ${ZIP_NAME}${NC}"

# Get the absolute path to the build directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ABS_BUILD_DIR="${SCRIPT_DIR}/${BUILD_DIR}"

# Make sure the build directory exists
mkdir -p "$ABS_BUILD_DIR"

# Create the zip file from the temp directory
cd "$TEMP_DIR"
zip -r -q "${ABS_BUILD_DIR}/${ZIP_NAME}" . -x ".*"
ORIGINAL_DIR="${SCRIPT_DIR}"
cd "$ORIGINAL_DIR"

# Also create a "latest" version without timestamp
LATEST_ZIP="${EXTENSION_NAME}_latest.zip"
cp "${BUILD_DIR}/${ZIP_NAME}" "${BUILD_DIR}/${LATEST_ZIP}"

# Cleanup temporary directory
rm -rf "$TEMP_DIR"

# Get file size
FILE_SIZE=$(du -h "${BUILD_DIR}/${ZIP_NAME}" | cut -f1)

echo -e "${GREEN}✅ Build complete!${NC}"
echo -e "${GREEN}📦 Package: ${BUILD_DIR}/${ZIP_NAME} (${FILE_SIZE})${NC}"
echo -e "${GREEN}📦 Latest: ${BUILD_DIR}/${LATEST_ZIP}${NC}"
echo -e ""
echo -e "${BLUE}To install the extension:${NC}"
echo -e "  1. Open Chrome and go to chrome://extensions/"
echo -e "  2. Enable 'Developer mode' (toggle in top-right)"
echo -e "  3. Click 'Load unpacked' and select the browser-extension directory"
echo -e "     OR upload the ${ZIP_NAME} file"
echo -e ""
