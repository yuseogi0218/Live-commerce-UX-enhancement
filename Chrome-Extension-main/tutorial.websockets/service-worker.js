const TEN_SECONDS_MS = 10 * 1000;
let webSocket = null;
let broadcastId;

// Content.js 로부터 받은 방송 Id
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.type === 'BROADCASTID') {
    broadcastId = request.payload.message;

    if (webSocket) {
      disconnect();
    } else {
      connect();
      keepAlive();
    }
    
    sendResponse({
      broadcastId,
    });
  }
});

// 
function connect() {
  webSocket = new WebSocket('ws://{자동 답변 생성 프로젝트의 EC2 인스턴스 주소}/ws/' + broadcastId);

  webSocket.onopen = (event) => {
    chrome.action.setIcon({ path: 'icons/socket-active.png' });
  };

  webSocket.onmessage = (event) => {
    // content script 에 데이터 전송
    console.log(event.data);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, event.data);
    });
  };

  webSocket.onclose = (event) => {
    chrome.action.setIcon({ path: 'icons/socket-inactive.png' });
    console.log('websocket connection closed');
    webSocket = null;
  };
}

function disconnect() {
  if (webSocket) {
    webSocket.close();
  }
}

function keepAlive() {
  const keepAliveIntervalId = setInterval(
    () => {
      if (webSocket) {
        console.log('ping');
        
      } else {
        clearInterval(keepAliveIntervalId);
      }
    },
    // It's important to pick an interval that's shorter than 30s, to
    // avoid that the service worker becomes inactive.
    TEN_SECONDS_MS
  );
}
