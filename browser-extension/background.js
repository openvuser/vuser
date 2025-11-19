console.log("Background script loaded");

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "processText") {
    // Send the text to the LLM
    // Replace with actual LLM integration
    const llmResponse = "LLM processed: " + request.text;
    sendResponse({result: llmResponse});
  }
});