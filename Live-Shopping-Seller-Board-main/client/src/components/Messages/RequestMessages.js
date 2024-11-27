import React from 'react';

import ScrollToBottom from 'react-scroll-to-bottom';

import RequestMessage from './Message/RequestMessage';

import './Messages.css';

function RequestMessages({ messages }){
  return(
    <ScrollToBottom className="messages">
    {messages.map((message, i) => <div key={i}><RequestMessage message={message} /></div>)}
    </ScrollToBottom>
  );
}

export default RequestMessages;