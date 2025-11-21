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

document.getElementById('listTabs').onclick = () => {
  chrome.tabs.query({}, (tabs) => {
    const info = tabs.map(t => ({
      id: t.id,
      title: t.title,
      url: t.url,
      status: t.status,
      active: t.active,
      windowId: t.windowId
    }));
    tabsOut.textContent = JSON.stringify(info, null, 2);
  });
};