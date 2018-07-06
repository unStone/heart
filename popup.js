var popupData = chrome.extension.getBackgroundPage().popup;
var manageObj = chrome.extension.getBackgroundPage().manage;

var changeCacheRadio = function(e) {
  popupData.setCacheType(e.target.dataset.index);
};

var setCacheRadioChange = function(cacheRadioDom) {
  for(var i = 0; i < cacheRadioDom.length; i++) {
    cacheRadioDom[i].onchange = changeCacheRadio;
  }
};

var setCacheRadioChecked = function(cacheRadioDom, index, checked) {
  cacheRadioDom[index].checked = checked;
};

var iconNode = (function() {
  var Node = function(manageMsg) {
    this.node = null
    this.setIconStyle = function(styleObj) {
      for(var key in styleObj) {
        this.node.style[key] = styleObj[key]
      }
      return this
    }
    this.setIconAttribute = function(attributeObj) {
      for(var key in attributeObj) {
        this.node.setAttribute(key, attributeObj[key]);
      }
      return this
    }
    this.isEnabled = function(){
      manageMsg.enabled ? this.node.classList.add('on') : this.node.classList.add('off');
    }
    this.open = function(){
      var the = this
      manageObj.setEnabled(this.node.dataset.id, true, function() {
        the.node.classList.remove('off');
        the.node.classList.add('on');
        the.setIconStyle({
          backgroundImage: `url(${the.node.dataset.url})`,
        })
      })
    }
    this.close = function(){
      var the = this;
      manageObj.setEnabled(this.node.dataset.id, false, function() {
        the.node.classList.remove('on');
        the.node.classList.add('off');
        the.setIconStyle({
          backgroundImage: `url(${the.node.dataset.url}?grayscale=true)`,
        })
      })
    }
    this.action = function() {
      this.node.classList.contains('off') ? this.open() : this.close()
    }

    this.init = function() {
      if (manageMsg.nodeType === 1) return this.node = manageMsg;
      var url = manageMsg.icons.length ? manageMsg.icons.pop().url : '';
      var styleObj = {
        backgroundImage: `url(${url}${manageMsg.enabled ? '' : '?grayscale=true'})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
      }
      var attributeObj = {
        title: manageMsg.name,
        'data-id': manageMsg.id,
        'data-url': url
      }
      this.node = document.createElement('div');
      this.isEnabled();
      this.setIconStyle(styleObj)
      this.setIconAttribute(attributeObj)
    }
    this.init()
  }
  
  var $ = function(manageMsg) {
    return new Node(manageMsg)
  }

  return $;
})()

;(function init() {
  var cacheRadioDom = document.getElementsByClassName('cacheRadio');
  setCacheRadioChecked(cacheRadioDom, popupData.getCacheType(), 'checked');
  setCacheRadioChange(cacheRadioDom);

  var manageDom = document.getElementById('manage');
  manageObj.getAll(function(manages){
    manages.forEach(manage => {
      var node = iconNode(manage).setIconStyle().setIconAttribute().node;
      node.classList.add('iconBox');
      manageDom.appendChild(node);
    });
  })
  document.addEventListener('click', function (e) {
    if(!e.target.classList.contains('iconBox')) return;
    iconNode(e.target).action();
  })
})()

