// with trailing slash
// const BASE_URL = "http://localhost:5080/";
const BASE_URL = "https://app.vetd.com/";

async function forwardMessage(message) {
  try {
    const response = await fetch(`${BASE_URL}forward`, {
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

chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    // TODO? additional security
    // if (sender.url !== "substring domain?")
    //   return; // don't allow this web page access
    
    if (request.command == "setVetdUser") {
      chrome.storage.sync.set(
        {
          vetdUser: JSON.stringify(request.args.vetdUser)
        },
        () => {
          sendResponse(true)
        }
      );
      
      return true;  // Will respond asynchronously.
    }
  }
);


// On first install, open Vetd platform
// This increases the liklihood that user will link their Vetd account.
chrome.runtime.onInstalled.addListener(function (details) {	
  if (details.reason === 'install') {	
    chrome.tabs.create(
      {
        url: `${BASE_URL}chrome-extension-installed`
      }
    )	
  }	
})
