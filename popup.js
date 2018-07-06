var popupData = chrome.extension.getBackgroundPage().popup;
var manageObj = chrome.extension.getBackgroundPage().manage;
var RightClickId = null;

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

var iconBox = {
  init: function() {
    var manageDom = document.getElementById('manage');
    while(manageDom.hasChildNodes()) //当manageDom下还存在子节点时 循环继续
    {
      manageDom.removeChild(manageDom.firstChild);
    }

    manageObj.getAll(function(manages){
      manages.forEach(manage => {
        var node = iconNode(manage).setIconStyle().setIconAttribute().node;
        node.classList.add('iconBox');
        manageDom.appendChild(node);
      });
    })
    // 点击图标时
    document.addEventListener('click', function (e) {
      if(e.target.classList.contains('iconBox')) {
        iconNode(e.target).action();
      };
    })
  }
}

var RightClick = {
  oncontextmenu: function(e) {
    if(!e.target.classList.contains('iconBox')) return document.querySelector('#menu').style.display = 'none';

    RightClickId = e.target.dataset.id;
    //取消默认的浏览器自带右键 很重要！！
    e.preventDefault();
    
    //获取我们自定义的右键菜单
    var menu = document.querySelector("#menu");
    var root = document.querySelector("#root");
    
    //根据事件对象中鼠标点击的位置，进行定位，尽量防止遮挡
    root.offsetWidth - e.pageX > menu.offsetWidth ? menu.style.left = e.clientX + 'px' : menu.style.left = e.clientX - menu.offsetWidth +'px';
    menu.style.top = e.clientY + 'px';
    
    //改变自定义菜单的宽，让它显示出来
    menu.style.display = 'block';
  },
  closeMenu: function(e) {
    if(e.target.classList.contains('munuItem')) {
      manageObj.uninstall(RightClickId, function() {
        iconBox.init()
      })
    };
    document.querySelector('#menu').style.display = 'none';
  },
  init: function() {
    // 右键卸载功能
    window.oncontextmenu = this.oncontextmenu;
    //关闭右键菜单
    window.onclick = this.closeMenu;
  }
}

;(function init() {
  var cacheRadioDom = document.getElementsByClassName('cacheRadio');
  setCacheRadioChecked(cacheRadioDom, popupData.getCacheType(), 'checked');
  setCacheRadioChange(cacheRadioDom);

  iconBox.init();
  RightClick.init()
})()
