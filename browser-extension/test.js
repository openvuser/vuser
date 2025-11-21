const out = document.getElementById('out');
const tabsOut = document.getElementById('tabsOut');

document.getElementById('ping').onclick = () => {
  chrome.runtime.sendNativeMessage('org.vuser.protocol.host',
    {cmd:'ping'},
    (resp) => {
      out.textContent = JSON.stringify(resp, null, 2);
      if (chrome.runtime.lastError) {
        out.textContent = 'Error: ' + chrome.runtime.lastError.message;
      }
    }
  );
};

document.getElementById('listTabs').onclick = async () => {
  chrome.tabs.query({}, async (tabs) => {
    const tabsWithMcp = await Promise.all(tabs.map(async (t) => {
      let mcpEnabled = false;
      
      // Only check for MCP on http/https URLs
      if (t.url && (t.url.startsWith('http://') || t.url.startsWith('https://'))) {
        try {
          const results = await chrome.scripting.executeScript({
            target: { tabId: t.id },
            world: 'MAIN',
            func: () => {
              return !!(window.vuserMcp || window.mcp);
            }
          });
          mcpEnabled = results && results[0] && results[0].result;
        } catch (e) {
          // Tab might not be injectable (extension pages, chrome://, etc.)
          mcpEnabled = false;
        }
      }
      
      return {
        id: t.id,
        title: t.title,
        url: t.url,
        status: t.status,
        active: t.active,
        windowId: t.windowId,
        mcpEnabled: mcpEnabled
      };
    }));
    
    tabsOut.textContent = JSON.stringify(tabsWithMcp, null, 2);
  });
};