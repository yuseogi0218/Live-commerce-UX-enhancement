import React, { useState, useEffect } from "react";
import queryString from 'query-string';
import io from "socket.io-client";

import AllMessages from '../Messages/AllMessages'
import RequestMessages from '../Messages/RequestMessages'
import QuestionMessages from '../Messages/QuestionMessages'

import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';

import {API} from '../../config';


import './Chat.css';

const NodeJS_URL = `${API.NodeJS_URL}/`

let socket;


function Chat({ location }) {

  const { broadcastId } = queryString.parse(location.search);
  const [question, setQuestion] = useState('');
  const [message, setMessage] = useState('');
  const [messageNo, setMessageNo] = useState('');
  const [messages, setMessages] = useState([]);
  const [pythonWebSocket, setPythonWebSocket] = useState(null);

  useEffect(() => {
    const { broadcastId } = queryString.parse(location.search);
    
    // Node JS Websocket 연결
    socket = io(NodeJS_URL);

    socket.emit('join', { broadcastId } , (error) => {
      if(error) {
        alert(error);
      }
    });

    // Python Fast API socket 에 연결
    const pythonWs = new WebSocket('{자동 답변 생성 프로젝트의 EC2 인스턴스 주소}/ws/' + broadcastId); 
    setPythonWebSocket(pythonWs);

  }, [NodeJS_URL, location.search]);

  
  // Node JS Websocket 연결 -> 채팅 의도 분류 결과 수신
  useEffect(() => {
    socket.emit('getChats', broadcastId);

    socket.on('message', message => {

      const messageList = JSON.parse(message.text).chat_data; 

      messageList.map((message, idx) => {
        setMessages(messages => [ ...messages, message ]);
      })
    });
  }, []);

  // Python Fast API Socket 에 질문에 대한 답변 생성 요청
  const sendMessage = (event) => {
    event.preventDefault();

    var answerContainer = document.getElementById(messageNo);
    var answerMessage = answerContainer.getElementsByClassName("messageText")[0];

    answerMessage.innerText = message;
    answerContainer.style.display = 'flex';

    // Python Socket 에 answer 전송
    if (pythonWebSocket) {
      pythonWebSocket.send(JSON.stringify({"message" : message, "question" : question}));
    }
    
  }

  return (
    <div className="ChatouterContainer">
      <div className="container">
          <InfoBar intend = "General" />
          <AllMessages messages={messages}  />
      </div>
      <div className="container">
          <InfoBar intend = "Question" />
          <QuestionMessages messages={messages} broadcastId={broadcastId} setMessage={setMessage} setMessageNo={setMessageNo} setQuestion={setQuestion}/>
          <Input message={message} setMessage={setMessage} sendMessage={sendMessage}/>
      </div>
      <div className="container">
          <InfoBar intend = "Request" />
          <RequestMessages messages={messages} />
      </div>
    </div>
  );
}

export default Chat;
