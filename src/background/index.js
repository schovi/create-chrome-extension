import welcome from 'shared/welcome'

welcome('background/index.js')

// Setting popup icon

// When we defined browser_action
if(chrome.browserAction) {
  chrome.browserAction.setIcon({
    path: require("icons/webpack-38.png")
  })

// When we defined page_action
} else if(chrome.pageAction) {

  const showPageAction = function(tabId) {
    chrome.pageAction.show(tabId);

    chrome.pageAction.setIcon({
      path: require("icons/webpack-38.png"),
      tabId: tabId
    })
  }

  // Show page action on each page update
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    showPageAction(tabId)
  });
}
