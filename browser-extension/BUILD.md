# Chrome Extension Build Script

This directory contains a build script to package the Vuser Chrome extension into a distributable zip file.

## Quick Start

To build the Chrome extension, run:

```bash
npm run build
```

Or run the script directly:

```bash
./build.sh
```

## What Gets Built

The build script creates:
- **Timestamped zip**: `dist/vuser-chrome-extension_YYYYMMDD_HHMMSS.zip`
- **Latest version**: `dist/vuser-chrome-extension_latest.zip`

Both files contain the same content, but the "latest" version makes it easy to always reference the most recent build.

## Included Files

The zip contains:
- `manifest.json` - Extension manifest
- `background.js` - Background service worker
- `content.js` - Content script
- `test.html` & `test.js` - Test/popup UI
- `icons/` - Extension icons
- `popup/` - Popup UI components

## Excluded Files

The following are automatically excluded:
- `node_modules/`
- `build/` & `dist/` directories
- Test files (`tests/`)
- Documentation (`.md` files)
- Package management files (`package.json`, `package-lock.json`)
- Git and system files (`.git`, `.DS_Store`)

## Installing the Extension

### Method 1: Load Unpacked (Development)
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `browser-extension` directory

### Method 2: Install from Zip
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode**
3. Drag and drop the zip file onto the extensions page

## Build Commands

All of these commands do the same thing (run `build.sh`):
```bash
npm run build         # Main build command
npm run build:zip     # Explicit zip build
npm run build:chrome  # Chrome-specific build
```

## Output Structure

```
browser-extension/
├── dist/
│   ├── vuser-chrome-extension_20251125_093420.zip  (timestamped)
│   └── vuser-chrome-extension_latest.zip           (latest copy)
├── build.sh          (this build script)
└── ...
```

## Troubleshooting

**Permission denied when running `build.sh`:**
```bash
chmod +x build.sh
```

**Zip command not found:**
Install zip utility (should be pre-installed on macOS):
```bash
brew install zip  # macOS
```

## Distribution

For distribution, use the timestamped zip file to maintain version history, or use the `latest.zip` file for convenience in automated systems.
