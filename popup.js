var popupData = chrome.extension.getBackgroundPage().popup;

var setHelpJump = function() {
  document.getElementById('ruleOfUrl').onclick = function(e) {
    window.open(e.target.dataset.help);
  }
};

var changeCacheRadio = function(e) {
  popupData.setCacheType(e.target.dataset.index);
};

var setCacheRadioChange = function(cacheRadio) {
  for(var i = 0; i < cacheRadio.length; i++) {
    cacheRadio[i].onchange = changeCacheRadio;
  }
};

var changeCacheUrlList = function(cacheUrlList, getFilterUrl) {
  cacheUrlList.value = getFilterUrl().join(',');
}

var setCacheUrlListchange = function(cacheUrlList, setFilterUrl) {
  cacheUrlList.onchange = function(e) {
    setFilterUrl(e.target.value.split(','));
  }
};

var setCacheRadioChecked = function(cacheRadio, index, checked) {
  cacheRadio[index].checked = checked;
};

;(function init() {
  var cacheUrlList = document.getElementById('cacheUrlList');
  changeCacheUrlList(cacheUrlList, popupData.getFilterUrl);
  setCacheUrlListchange(cacheUrlList, popupData.setFilterUrl);

  var cacheRadio = document.getElementsByClassName('cacheRadio');
  setCacheRadioChecked(cacheRadio, popupData.getCacheType(), 'checked');
  setCacheRadioChange(cacheRadio);

  setHelpJump();
})()