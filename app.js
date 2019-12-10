/*! Vetd (the company that created this extension) is an accelerator-backed company (Village Global).
 * We use the popular InboxSDK library (www.inboxsdk.com) also used by several large organizations: 
 *   Dropbox (https://chrome.google.com/webstore/detail/dropbox-for-gmail-beta/dpdmhfocilnekecfjgimjdeckachfbec)
 *   HubSpot (https://chrome.google.com/webstore/detail/hubspot-sales/oiiaigjnkhngdbnoookogelabohpglmd)
 *   Stripe (https://chrome.google.com/webstore/detail/stripe-for-gmail/dhnddbohjigcdbcfjdngilgkdcbjjhna)
 *   Giphy (https://chrome.google.com/webstore/detail/giphy-for-gmail/andgibkjiikabclfdkecpmdkfanpdapf)
 *   Clearbit (https://chrome.google.com/webstore/detail/clearbit-connect-supercha/pmnhcgfcafcnkbengdcanjablaabjplo)
 * The use of the library is similar to using other popular javascript libraries like jQuery and Underscore
 *
 * The library allows us to load our application code from our server providing our users with fast updates
 * and the ability quickly respond to bugs.
 */

InboxSDK.load(2, 'sdk_vetd-extension_a96a1115ad').then(function(sdk){

  sdk.Toolbars.registerThreadButton({
    title: "Forward to Vetd",
    iconUrl: chrome.extension.getURL('icon.png'),
    positions: ["THREAD"],
    threadSection: "INBOX_STATE",
    onClick: function(event) {
      // console.log("selectedThreadViews: ",
      //             event.selectedThreadViews,
      //             "selectedThreadRowViews: ",
      //             event.selectedThreadRowViews);

      // console.log("getMessageViews: ",
      //             event.selectedThreadViews[0].getMessageViews(),
      //             "getMessageViewsAll: ",
      //             event.selectedThreadViews[0].getMessageViewsAll());

      if (event.selectedThreadViews.length) {
        let messageViews = event.selectedThreadViews[0].getMessageViews();

        if (messageViews.length) {
          let messageView = messageViews[0];

          messageView.getMessageIDAsync().then(messageId => {
            let message = {
              messageId: messageId,
              bodyElement: messageView.getBodyElement(),
              sender: messageView.getSender(),
              dateString: messageView.getDateString()
            };

            console.log(message);

            let butterBarMessage = sdk.ButterBar.showMessage({
              text: "Conversation forwarded to Vetd.",
              time: 7000
            });

            sdk.Router.goto(sdk.Router.NativeRouteIDs.INBOX);
          });          
        }
      }
    },
  });
});
