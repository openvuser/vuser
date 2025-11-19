console.log("Background script loaded");

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "processText") {
    // Send the text to the LLM
    // Replace with actual LLM integration
    const llmResponse = "LLM processed: " + request.text;
    sendResponse({result: llmResponse});
  }
});


// Native Messaging Integration
let port = null;

function connectToNativeHost() {
  const hostName = "org.vuser.protocol.host";
  port = chrome.runtime.connectNative(hostName);

  port.onMessage.addListener(function(msg) {
    console.log("Received" + msg);
  });

  port.onDisconnect.addListener(function() {
    console.log("Disconnected");
    port = null;
    // Try to reconnect after a delay?
    // setTimeout(connectToNativeHost, 5000); 
  });
}

connectToNativeHost();

// Listen for messages from the Native Host (via the port)
// Actually, the port.onMessage handles messages FROM the host.
// We need to handle requests that might come from the host? 
// The host acts as a server. When it gets a request, it sends a message to Chrome.
// Chrome needs to listen to that message, process it, and send a response back.

if (port) {
    port.onMessage.addListener((message) => {
        if (message.action === "getTabs") {
            chrome.tabs.query({}, (tabs) => {
                // Send tabs back to the host
                // We need to include the message ID if we want to support concurrent requests, 
                // but for now simple request-response.
                port.postMessage({ id: message.id, tabs: tabs });
            });
        }
    });
} else {
    // Re-add listener inside connectToNativeHost or ensure port is valid
}

// Refined implementation replacing the above rough logic:
chrome.runtime.onStartup.addListener(connectToNativeHost);
chrome.runtime.onInstalled.addListener(connectToNativeHost);

// Since connectNative is synchronous, we can just define the listener logic properly.
function setupNativeConnection() {
    const hostName = "org.vuser.protocol.host";
    port = chrome.runtime.connectNative(hostName);
    
    port.onMessage.addListener((message) => {
        console.log("Received message from host:", message);
        if (message.action === "getTabs") {
            chrome.tabs.query({}, (tabs) => {
                const tabData = tabs.map(t => ({
                    id: t.id,
                    title: t.title,
                    url: t.url,
                    status: t.status,
                    active: t.active
                }));
                port.postMessage({ id: message.id, tabs: tabData });
            });
        }
    });

    port.onDisconnect.addListener(() => {
        console.log("Disconnected from native host");
        port = null;
    });
}

// Call setup immediately to ensure it runs when background script loads
setupNativeConnection();