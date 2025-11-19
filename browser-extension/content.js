console.log("Content script loaded");

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action == "getText") {
      var selectedText = window.getSelection().toString();
      chrome.runtime.sendMessage({action: "processText", text: selectedText}, function(response) {
        sendResponse({result: response.result});
      });
    }
    return true;
  });