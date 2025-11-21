# Vuser AI Platform Browser Extension

This extension integrates the Vuser AI Platform with the browser, allowing external agents to query tab state, switch tabs, and call MCP functions on supported sites.

## Features

1.  **Query Open Tabs**: Get a list of all open tabs with their ID, URL, and status.
2.  **Switch Tab**: Activate a specific tab.
3.  **Create Tab**: Open a new tab with a specific URL.
4.  **Call MCP Functions**: Execute functions exposed by websites (via `window.vuserMcp`) from an external agent.

## Setup

1.  **Install Native Host**:
    Run the installation script to register the Native Messaging Host.
    ```bash
    ./install_host.sh
    ```

2.  **Load Extension**:
    - Open Chrome and go to `chrome://extensions`.
    - Enable "Developer mode".
    - Click "Load unpacked" and select the `browser-extension` directory.
    - Copy the generated **Extension ID**.

3.  **Update Native Host Manifest**:
    - Edit `native-test-host/org.vuser.protocol.host.json`.
    - Replace `<EXTENSION_ID>` with the ID you copied.
    - Re-run `./install_host.sh` or manually copy the JSON to the NativeMessagingHosts directory.

4.  **Run the Host Server**:
    The native host is started automatically by Chrome when the extension loads. However, for the HTTP server to be accessible, the host script must be running. The current architecture starts the HTTP server inside the native host process, which is managed by Chrome.

## API Usage (Local HTTP Server)

The Native Host exposes an HTTP server on `localhost:8080`.

### Get Tabs
**GET** `/tabs`
Response:
```json
[
  { "id": 123, "title": "Example", "url": "https://example.com", "active": true }
]
```

### Switch Tab
**POST** `/switch`
Body:
```json
{ "tabId": 123 }
```

### Create Tab
**POST** `/create`
Body:
```json
{ "url": "https://example.com", "active": true }
```

### Call MCP Function
**POST** `/mcp`
Body:
```json
{
  "tabId": 123,
  "function": "getWalletBalance",
  "args": ["0x123..."]
}
```
*Note: The target page must expose `window.vuserMcp` or `window.mcp` object containing the function.*
