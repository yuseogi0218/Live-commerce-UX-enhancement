// URL 에서 방송 Id 추출
const regex = /[^0-9]/g;
const broadcastUrl = window.location.toString();
const broadcastId = broadcastUrl.replace(regex, '');

// 추출한 방송 Id 를 background 작업을 수행하는 service-worker.js 에 전송
chrome.runtime.sendMessage(
  {
    type: 'BROADCASTID',
    payload: {
      message: broadcastId,
    },
  },
  (response) => {
    console.log(response);
  }
);

// 네이버 라이브 쇼핑의 채팅 HTML 엘리먼트
var element = document.getElementsByClassName("CommentList_animation_area_Ca5J9");

// Service Worker로부터 메시지 수신
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // Service Worker에서 보낸 데이터 확인 (Websocket 으로부터 받은 관리자의 (질문, 답변) 쌍)
    console.log(request);
    var receivedData = JSON.parse(request);

    // 질문 태그 생성
    const chatNodeQuestion = document.createElement('div');
    chatNodeQuestion.setAttribute("role", "presentation");
    chatNodeQuestion.className += "Comment_wrap_wRrdF __disable_vertical_swipe";

    const chatQuestion = document.createElement('strong');
    chatQuestion.setAttribute("role", "presentation");
    chatQuestion.className += "NoticeComment_wrap_9z2HJ NoticeComment_orange_mGKA9 __disable_vertical_swipe";
    
    chatQuestion.innerText = receivedData["question"];
    
    chatNodeQuestion.appendChild(chatQuestion);

    // 질문 태그 채팅 HTML 엘리먼트에 추가
    element[0].appendChild(chatNodeQuestion);

    // 답변 태그 생성
    const chatNodeAnswer = document.createElement('div');
    chatNodeAnswer.setAttribute("role", "presentation");
    chatNodeAnswer.className += "Comment_wrap_wRrdF __disable_vertical_swipe";

    const chatAnswer = document.createElement('strong');
    chatAnswer.setAttribute("role", "presentation");
    chatAnswer.className += "NoticeComment_wrap_9z2HJ NoticeComment_green_D2UCQ __disable_vertical_swipe";
    
    chatAnswer.innerText = receivedData["message"];
    
    chatNodeAnswer.appendChild(chatAnswer);

    // 답변 태그 채팅 HTML 엘리먼트에 추가
    element[0].appendChild(chatNodeAnswer);


});