async function forwardMessage(message) {
  try {
    // TODO change forward URL
    const response = await fetch(`http://localhost:5080/forward`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });
    const json = await response.json();
    return json;
  } catch (e) {
    console.log("forwardMessage Error: ", e);
    return false;
  }
};

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.command == "forwardMessage") {
      forwardMessage(request.args.message).then(response => sendResponse(response));
      
      return true;  // Will respond asynchronously.
    }
  }
);

