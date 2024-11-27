import React from 'react';

import './Message.css';

const RequestMessage = ({ message }) => {

  
  if(message.result==="요청"){
    return (
      <div>
          <div className="idContainer">
            {message.nickname}
          </div>
          <div className="messageContainer justifyStart" key={message.commentNo} >
            <div className="messageBox backgroundGray">
              
              <p className="messageText colorDark">
                
                {message.message}<br />
              </p>
              </div>
          </div>
      </div>  
    );
  }else{
    return (<div></div>);
  }
  
}

export default RequestMessage;