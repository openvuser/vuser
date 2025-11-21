# Host Permission Justification

## Overview
The Vuser Browser Extension acts as a bridge between an external AI Orchestrator (running locally) and the user's web browsing experience. It allows the AI to understand the browser state and interact with web pages via the Model Context Protocol (MCP).

## Permissions Breakdown

### `host_permissions`: `["<all_urls>"]`
**Justification:**
The extension is designed to work as a universal AI assistant that can interact with *any* website the user visits.
1.  **Universal MCP Support:** The extension checks for the presence of a `window.vuserMcp` object on any page to determine if the site supports the Model Context Protocol. Since any website can implement this protocol, the extension must have access to all URLs to detect and interact with these features.
2.  **Context Awareness:** The AI agent needs to know the URL and title of all open tabs to provide relevant assistance and context switching.
3.  **Script Injection:** The extension uses the `scripting` API to execute specific, deterministic functions on pages (as defined by the site publisher) when requested by the user's AI agent. This requires host permissions for the target pages.

### `permissions`: `["tabs"]`
**Justification:**
1.  **State Querying:** The core feature of the extension is to provide the local AI agent with a list of all open tabs (`chrome.tabs.query`). This allows the AI to "see" what the user is working on across the entire browser, not just the active tab.
2.  **Navigation & Switching:** The AI agent can switch the active tab (`chrome.tabs.update`) to help the user navigate between contexts or to bring a specific page into focus for an action.
3.  **Tab Creation:** The AI agent can open new tabs (`chrome.tabs.create`) to assist the user.

### `permissions`: `["activeTab"]`
**Justification:**
1.  **Immediate Access:** Grants the extension temporary, elevated privileges to the currently active tab when the user explicitly interacts with the extension (e.g., clicking the icon).
2.  **Privacy-First Fallback:** Ensures that even if the user restricts broad host permissions, the extension can still function on the specific page the user is currently looking at when they invoke the AI assistant.
3.  **Script Injection:** Facilitates the injection of content scripts or execution of MCP functions on the active tab without requiring a permanent permission grant for that specific origin.

### `permissions`: `["nativeMessaging"]`
**Justification:**
1.  **Communication Bridge:** This is the most critical permission. The extension does not contain the AI logic itself; it connects to a local "Host" process (the AI Agent) via standard input/output.
2.  **Security:** This architecture ensures that the AI logic runs outside the browser sandbox, allowing for more powerful processing while keeping the browser extension lightweight and focused on DOM interaction.

### `permissions`: `["scripting"]`
**Justification:**
1.  **MCP Execution:** When the AI agent needs to perform an action on a website (e.g., "book a flight" on a supported site), it sends a command to the extension. The extension uses `chrome.scripting.executeScript` to call the corresponding function exposed by the site's `window.vuserMcp` object.
2.  **Isolation:** This ensures that code is only executed when explicitly triggered by the authenticated local AI agent.

## Data Usage & Privacy
- **Local Processing:** All data regarding open tabs and page content is sent *only* to the local Native Messaging Host. It is not sent to any remote Vuser servers.
- **User Control:** The user must explicitly install the Native Host and the Extension. The AI agent only acts on user intent.
