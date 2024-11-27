import React from 'react';

import './Message.css';

const AllMessage = ({ message }) => {

  if (message.result === "일반"){
    return (
      <div>
        <div className="idContainer">
            {message.nickname}
          </div>
        <div className="messageContainer justifyStart" key={message.commentNo}>
          <div  className="messageBox backgroundGray">
            <p className="messageText colorDark">
              {message.message}<br />
            </p>
          </div>
        </div>
      </div> 
    );
  }else {
    return (<div></div>);
  }
}

export default AllMessage;