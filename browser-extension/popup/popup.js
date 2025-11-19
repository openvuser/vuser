console.log("Popup script loaded");

chrome.tabs.executeScript({
  code: 'window.getSelection().toString();'
}, function(selection) {
  document.getElementById('selectedText').textContent = selection[0];
});

function listTabs() {
  chrome.tabs.query({}, function(tabs) {
    const tabsList = document.getElementById('tabs-list');
    tabsList.innerHTML = ''; // Clear existing list
    
    if (tabs.length === 0) {
      tabsList.textContent = 'No tabs found.';
      return;
    }

    const ul = document.createElement('ul');
    tabs.forEach(function(tab) {
      const li = document.createElement('li');
      li.className = 'tab-item';
      
      const title = document.createElement('div');
      title.className = 'tab-title';
      title.textContent = tab.title || '(No Title)';
      
      const url = document.createElement('div');
      url.className = 'tab-url';
      url.textContent = tab.url || '(No URL)';
      
      const status = document.createElement('div');
      status.className = 'tab-status';
      status.textContent = `Status: ${tab.status} | ID: ${tab.id}`;

      li.appendChild(title);
      li.appendChild(url);
      li.appendChild(status);
      ul.appendChild(li);
    });
    
    tabsList.appendChild(ul);
  });
}

// Call listTabs when popup loads
document.addEventListener('DOMContentLoaded', listTabs);