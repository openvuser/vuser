console.log("Popup script loaded");

chrome.tabs.executeScript({
  code: 'window.getSelection().toString();'
}, function(selection) {
  document.getElementById('selectedText').textContent = selection[0];
});