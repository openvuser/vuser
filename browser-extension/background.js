console.log("Background script loaded");

let port = null;

function connectToNativeHost() {
    const hostName = "org.vuser.protocol.host";
    port = chrome.runtime.connectNative(hostName);
    
    port.onMessage.addListener(handleHostMessage);

    port.onDisconnect.addListener(() => {
        console.log("Disconnected from native host");
        port = null;
        // Optional: Retry logic could go here
    });
}

function handleHostMessage(message) {
    console.log("Received message from host:", message);
    const { action, id } = message;

    if (action === "getTabs") {
        handleGetTabs(id);
    } else if (action === "switchTab") {
        handleSwitchTab(id, message.tabId);
    } else if (action === "callMcp") {
        handleCallMcp(id, message.tabId, message.function, message.args);
    } else if (action === "createTab") {
        handleCreateTab(id, message.url, message.active);
    } else {
        console.warn("Unknown action:", action);
        if (port) port.postMessage({ id, error: "Unknown action" });
    }
}

function handleCreateTab(requestId, url, active) {
    chrome.tabs.create({ url: url, active: active !== false }, (tab) => {
        if (port) port.postMessage({ id: requestId, tab: { id: tab.id, url: tab.url, status: tab.status } });
    });
}

function handleGetTabs(requestId) {
    chrome.tabs.query({}, (tabs) => {
        const tabData = tabs.map(t => ({
            id: t.id,
            title: t.title,
            url: t.url,
            status: t.status,
            active: t.active,
            windowId: t.windowId
        }));
        if (port) port.postMessage({ id: requestId, tabs: tabData });
    });
}

function handleSwitchTab(requestId, tabId) {
    if (!tabId) {
        if (port) port.postMessage({ id: requestId, error: "Missing tabId" });
        return;
    }
    
    chrome.tabs.update(parseInt(tabId), { active: true }, (tab) => {
        if (chrome.runtime.lastError) {
            if (port) port.postMessage({ id: requestId, error: chrome.runtime.lastError.message });
        } else {
            // Also focus the window
            chrome.windows.update(tab.windowId, { focused: true });
            if (port) port.postMessage({ id: requestId, result: "Switched to tab " + tabId });
        }
    });
}

function handleCallMcp(requestId, tabId, functionName, args) {
    if (!tabId || !functionName) {
        if (port) port.postMessage({ id: requestId, error: "Missing tabId or functionName" });
        return;
    }

    chrome.scripting.executeScript({
        target: { tabId: parseInt(tabId) },
        world: "MAIN", // Execute in the page's context to access window objects
        func: (fn, args) => {
            // Check for the global object. We assume 'window.vuserMcp' or similar.
            // For flexibility, let's check a few common places or just 'window[fn]' if it's global.
            // But 'vuserMcp' namespace is safer.
            const mcp = window.vuserMcp || window.mcp;
            if (!mcp) return { error: "MCP object (window.vuserMcp) not found on page" };
            if (typeof mcp[fn] !== 'function') return { error: `Function ${fn} not found in MCP` };
            
            try {
                return Promise.resolve(mcp[fn](...args))
                    .then(res => ({ result: res }))
                    .catch(err => ({ error: err.toString() }));
            } catch (e) {
                return { error: e.toString() };
            }
        },
        args: [functionName, args || []]
    }, (results) => {
        if (chrome.runtime.lastError) {
            if (port) port.postMessage({ id: requestId, error: chrome.runtime.lastError.message });
            return;
        }
        
        // results is an array of InjectionResult
        const result = results[0].result;
        if (port) port.postMessage({ id: requestId, ...result });
    });
}

chrome.runtime.onStartup.addListener(connectToNativeHost);
chrome.runtime.onInstalled.addListener(connectToNativeHost);

// Initial connection
connectToNativeHost();