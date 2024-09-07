(function() {
  if (window.woodfishInitialized) return;
  window.woodfishInitialized = true;

  let woodfishFrame = null;
  let floatingButton = null;
  let currentCount = 0;

  function toggleWoodfish() {
    if (woodfishFrame) {
      document.body.removeChild(woodfishFrame);
      woodfishFrame = null;
      // 在缩小木鱼界面时获取最新的点击数
      chrome.storage.local.get(['count'], function(result) {
        currentCount = result.count || 0;
        showFloatingButton();
      });
    } else {
      if (floatingButton) {
        document.body.removeChild(floatingButton);
        floatingButton = null;
      }
      woodfishFrame = document.createElement('iframe');
      woodfishFrame.src = chrome.runtime.getURL('woodfish.html');
      woodfishFrame.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 256px;
        height: 256px;
        border: none;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        overflow: hidden;
      `;
      document.body.appendChild(woodfishFrame);
    }
  }

  function showFloatingButton() {
    floatingButton = document.createElement('div');
    floatingButton.id = 'woodfish-floating-button';
    updateFloatingButtonCount();
    floatingButton.style.cssText = `
      position: fixed;
      top: 20%;
      right: 0;
      width: 60px;
      height: 30px;
      background: linear-gradient(145deg, #007AFF, #5856D6);
      color: white;
      border: none;
      border-radius: 15px 0 0 15px;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: -2px 0 6px rgba(0, 0, 0, 0.1);
      z-index: 9999;
    `;
    document.body.appendChild(floatingButton);
    floatingButton.addEventListener('click', toggleWoodfish);
  }

  function updateFloatingButtonCount() {
    if (floatingButton) {
      floatingButton.innerHTML = currentCount.toString();
    }
  }

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "toggleWoodfish") {
      toggleWoodfish();
      sendResponse({status: "success"});
    } else if (request.action === "updateCount") {
      currentCount = request.count;
      updateFloatingButtonCount();
      sendResponse({status: "success"});
    } else if (request.action === "ping") {
      sendResponse({status: "ready"});
    }
    return true;
  });

  // 初始化时获取当前计数
  chrome.storage.local.get(['count'], function(result) {
    currentCount = result.count || 0;
    updateFloatingButtonCount();
  });

  // 通知背景脚本内容脚本已加载
  chrome.runtime.sendMessage({action: "contentScriptReady"});
})();