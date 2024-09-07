chrome.action.onClicked.addListener(async function(tab) {
  if (tab.url.startsWith("chrome://")) {
    console.log("Cannot run on chrome:// pages");
    return;
  }

  try {
    // 注入内容脚本
    await chrome.scripting.executeScript({
      target: {tabId: tab.id},
      files: ['content.js']
    });
    
    // 等待内容脚本准备就绪
    await waitForContentScript(tab.id);

    // 发送切换木鱼的消息
    await chrome.tabs.sendMessage(tab.id, {action: "toggleWoodfish"});
  } catch (error) {
    console.error("Error:", error);
  }
});

function waitForContentScript(tabId) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    const maxRetries = 10;
    const checkContentScript = () => {
      chrome.tabs.sendMessage(tabId, {action: "ping"}, response => {
        if (chrome.runtime.lastError) {
          if (retries < maxRetries) {
            retries++;
            setTimeout(checkContentScript, 100);
          } else {
            reject(new Error("Content script not ready after maximum retries"));
          }
        } else {
          resolve();
        }
      });
    };
    checkContentScript();
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "contentScriptReady") {
    console.log("Content script is ready");
  }
});