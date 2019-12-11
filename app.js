/*! Vetd (the company that created this extension) is an accelerator-funded company (Village Global).
 *  Our marketing website if located at https://vetd.com, and our platform is at https://app.vetd.com
 * 
 *  We use the popular InboxSDK library (www.inboxsdk.com) also used by several large organizations: 
 *   Dropbox (https://chrome.google.com/webstore/detail/dropbox-for-gmail-beta/dpdmhfocilnekecfjgimjdeckachfbec)
 *   HubSpot (https://chrome.google.com/webstore/detail/hubspot-sales/oiiaigjnkhngdbnoookogelabohpglmd)
 *   Stripe (https://chrome.google.com/webstore/detail/stripe-for-gmail/dhnddbohjigcdbcfjdngilgkdcbjjhna)
 *   Giphy (https://chrome.google.com/webstore/detail/giphy-for-gmail/andgibkjiikabclfdkecpmdkfanpdapf)
 *   Clearbit (https://chrome.google.com/webstore/detail/clearbit-connect-supercha/pmnhcgfcafcnkbengdcanjablaabjplo)
 * The use of the library is similar to using other popular javascript libraries like jQuery and Underscore
 *
 * The library allows us to load our application code from our server providing our users with fast updates
 * and the ability quickly respond to bugs. We aren't currently loading any dynamic code from our server,
 * but the InboxSDK library we rely on is dynamically updated to allow bugs to be patched quickly.
 */

InboxSDK.load(2, 'sdk_vetd-extension_a96a1115ad').then(function(sdk){

  const DEBUG = true;

  // Increment this counter whenever you want the ButterBar message
  // to show upon a return to inbox page.
  let showButterBarMessageNotArchived = 0;
  let showButterBarMessageArchived = 0;

  // Simulate a click on a button in the Gmail toolbar that has the given tooltip text
  const clickToolbarButtonByTooltip = (tooltip) => {
    const toolbarContainer = document.getElementsByClassName('inboxsdk__thread_toolbar_parent')[0];
    const button = toolbarContainer.querySelectorAll(`[data-tooltip="${tooltip}"][role="button"]`)[0];
    
    button.dispatchEvent(new MouseEvent('mousedown'));
    button.dispatchEvent(new MouseEvent('mouseup'));
  };

  // Check if a certain button is visible given tooltip text
  const isButtonVisibleByTooltip = (tooltip) => {
    const toolbarContainer = document.getElementsByClassName('inboxsdk__thread_toolbar_parent')[0];
    const button = toolbarContainer.querySelectorAll(`[data-tooltip="${tooltip}"][role="button"]`);

    return button.length > 0;
  };

  const getVetdUser = (callback) => {
    chrome.storage.sync.get(['vetdUser'], function(result) {
      const vetdUser = result.vetdUser;
      callback(
        (vetdUser ? JSON.parse(vetdUser) : false)
      );
    });
  };

  // Forward a message to Vetd servers.
  // Privacy Note: this function is only called on email conversations that the user explicitly clicks
  // the "Forward to Vetd" toolbar button.
  const forwardMessage = function (message) {
    message.content = message.bodyElement.innerHTML;
    delete message.bodyElement;

    chrome.runtime.sendMessage(
      {
        command: "forwardMessage",
        args: { message: message }
      },
      (result) => {
        if (DEBUG) {
          console.log("background returned: ", result);
        }

        if (result.success) {
          
          if (isButtonVisibleByTooltip("Move to Inbox")) {
            showButterBarMessageNotArchived++;
            // conversation is already archived
            sdk.Router.goto(sdk.Router.NativeRouteIDs.INBOX)
          } else {
            showButterBarMessageArchived++;
            clickToolbarButtonByTooltip("Archive");
            // this will naturally return to inbox page
          }
        }
      }
    );
  };

  sdk.Toolbars.registerThreadButton({
    title: "Forward to Vetd",
    iconUrl: chrome.extension.getURL('icon.png'),
    positions: ["THREAD"],
    threadSection: "INBOX_STATE",
    onClick: function(event) {
      if (event.selectedThreadViews.length) {
        let threadView = event.selectedThreadViews[0];
        let messageViews = threadView.getMessageViews();

        if (messageViews.length) {
          let messageView = messageViews[0];

          messageView.getMessageIDAsync().then(messageId => {
            messageView.getRecipientsFull().then(recipients => {
              getVetdUser((vetdUser) => {
                let message = {
                  messageId: messageId,
                  userEmailAddress: sdk.User.getEmailAddress(),
                  vetdUser: vetdUser,
                  recipients: recipients,
                  subject: threadView.getSubject(),
                  bodyElement: messageView.getBodyElement(),
                  sender: messageView.getSender(),
                  dateString: messageView.getDateString()
                };

                // show "Sending..." butterbar?
                if (DEBUG) {
                  console.log(message);
                }
                forwardMessage(message);
              });
            });
          });          
        }
      }
    },
  });

  sdk.Router.handleListRoute(sdk.Router.NativeRouteIDs.INBOX, (listRouteView) => {
    if (showButterBarMessageNotArchived > 0 || showButterBarMessageArchived > 0) {
      sdk.ButterBar.hideGmailMessage(); // try withiout this line

      if (showButterBarMessageNotArchived > 0) {
        showButterBarMessageNotArchived--;
        
        let butterBarMessage = sdk.ButterBar.showMessage({
          text: "Conversation forwarded to Vetd.",
          time: 7000
        });
      }
      
      if (showButterBarMessageArchived > 0) {
        showButterBarMessageArchived--;
        
        let butterBarMessage = sdk.ButterBar.showMessage({
          text: "Conversation archived and forwarded to Vetd.",
          time: 7000
        });
      }
    }
  });
});
