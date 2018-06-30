// 暂定百分点
var popup = (function(){
  var cacheType = '0';

  var getFilterUrl = function() {
    return JSON.parse(localStorage.getItem('filterUrl')) || ['<all_urls>']
  }
  var setFilterUrl = function(filterUrl) {
    localStorage.setItem('filterUrl', JSON.stringify(filterUrl))
  }
  var getCacheType = function() {
    return cacheType
  }
  var setCacheType = function(newCacheType) {
    cacheType = newCacheType;
  }

  return {
    getFilterUrl: getFilterUrl,
    setFilterUrl: setFilterUrl,
    getCacheType: getCacheType,
    setCacheType: setCacheType,
  }
})()

var getArrObjKeyValue = function(arr) {
  if(!Array.isArray(arr)) return{};
  var keyvalue = {};
  arr.forEach(function(obj) {
    keyvalue[obj.name] = obj.value;
  })

  return keyvalue
}

var setArrObjKeyValue = function(obj) {
  var arr = [];
  for(k in obj) {
    arr.push({
      name: k,
      value: obj[k]
    })
  }
  return arr
}

var i = 0;

chrome.runtime.onInstalled.addListener(function() {
  chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
      var random = `random=${Math.random().toString(16)}${Math.random().toString(16)}`
      var returnType = {
        0: function() {
          return {
            cancel: false,
          }
        },
        1: function() {
          return {
            cancel: false,
          }
        },
        2: function() {
          if(/random=/.test(details.url)) {
            return {
              cancel: false,
            }
          } else {
            return {
              redirectUrl: `${details.url.indexOf('?') !== -1 
                          ? details.url + '&' + random
                          : details.url + '?' + random}`
            }
          }
          if(/random=.*random=/.test(details.url)) {
            return {
              cancel: true,
            }
          }
        },
      }

      return returnType[popup.getCacheType()] ? returnType[popup.getCacheType()]() : returnType[0]();
    },
    {urls: popup.getFilterUrl()},
    ["blocking"]
  )
  
  chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
      var noCacheHeader = {
        cache: 'false',
        'Cache-Control': 'no-cache',
        'If-Modified-Since': '0',
      }
      var oldRequestHeader = details.requestHeaders;
      var newRequestHeader = Object.assign(getArrObjKeyValue(details.requestHeaders), noCacheHeader)
      var returnType = {
        0: function() {return {requestHeaders: oldRequestHeader};},
        1: function() {return {requestHeaders: setArrObjKeyValue(newRequestHeader)};},
        2: function() {return {requestHeaders: setArrObjKeyValue(newRequestHeader)};},
      }

      return returnType[popup.getCacheType()] ? returnType[popup.getCacheType()]() : returnType[0]()
    },
    {urls: popup.getFilterUrl()},
    ["blocking", "requestHeaders"]
  )
});
