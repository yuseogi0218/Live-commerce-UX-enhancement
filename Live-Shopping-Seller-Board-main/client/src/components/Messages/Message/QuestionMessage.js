import React,{useState, useEffect} from 'react';
import {API} from '../../../config';
import './Message.css';

let clickedDiv = '';

function QuestionMessage ({ message,  broadcastId, setMessage, setMessageNo, setQuestion }) {

  const handleDivClick = (event, message) => {

    if (clickedDiv!='') {
      const prevDiv = document.getElementById(clickedDiv);
      prevDiv.classList.remove("click");
      prevDiv.classList.add("backgroundGray");
    }
    // Add the "click" class to the clicked div and update the state
    event.target.classList.remove("backgroundGray");
    event.target.classList.add("click");
    clickedDiv = event.target.id;

  };

  function getAnswer(data){
    const question = data.message;

    const QA_URL = `${API.PythonQA_URL}/${broadcastId}/query?q=${question}`
    
    fetch(QA_URL)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("API 응답 데이터:", data);
      setMessage(data.answer);
      setMessageNo(message.commentNo);
    })
    .catch(error => {
      console.error("API 요청 오류:", error);
    });
    
  }
  
  if (message.result === "질문"){
    message.answer = "답변 예정";
    return (
      <div>
        <div className="idContainer">
          {message.nickname}
        </div>
        <div className="messageContainer justifyStart" 
        onClick={(event) => {
        setQuestion(message.message);
        getAnswer(message);
        handleDivClick(event, message);
        }}>
          <div className="messageBox backgroundGray" id={'q-' + message.commentNo} >
            <p className="messageText colorDark" onClick={(event) => {event.stopPropagation();}}>
              {message.message}<br />
            </p>
          </div>
        </div>
        <div id={message.commentNo} className="answerContainer justifyEnd">
          <div className="messageBox backgroundBlue">
          <p className="messageText colorWhite">
            답변 예정
          </p>
          </div>
        </div>
        
      </div>
    );
  } else{
    return (<div></div>);
  }
  
  
}

export default QuestionMessage;