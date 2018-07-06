var clearCache = function() {
  var millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
  var oneWeekAgo = (new Date()).getTime() - millisecondsPerWeek;
  
  //Chrome 19:
  chrome.browsingData.removeCache({
      "since": oneWeekAgo
    }, function() {
    clearRunning = false;
  });
};

var doClearCache = function(cacheType) {
  if(cacheType == 1) clearCache();
}

var popup = (function(){
  var cacheType = '0';
  var getCacheType = function() {
    return localStorage.getItem('cacheType') || '0'
  }
  var setCacheType = function(newCacheType) {
    doClearCache(newCacheType);
    localStorage.setItem('cacheType', newCacheType)
  }

  return {
    getCacheType: getCacheType,
    setCacheType: setCacheType,
  }
})()

chrome.webRequest.onBeforeRequest.addListener(
  function(detail) {
    doClearCache(popup.getCacheType());
  },
  {urls: ["<all_urls>"]},
)

var manage = (function(){
  var getAll = function(callback) {
    chrome.management.getAll(function(manage) {
      callback(manage)
    })
  }
  var launchApp = function(id) {
    chrome.management.launchApp(id)
  }
  var setEnabled = function(id, enabled, callback) {
    chrome.management.setEnabled(id, enabled, callback)
  }
  var uninstall = function(id, callback) {
    chrome.management.uninstall(id, callback)
  }
  return {
    getAll: getAll,
    launchApp: launchApp,
    setEnabled: setEnabled,
    uninstall: uninstall,
  }
})()

