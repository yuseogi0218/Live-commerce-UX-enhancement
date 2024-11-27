import React from 'react';

import ScrollToBottom from 'react-scroll-to-bottom';

import AllMessage from './Message/AllMessage';

import './Messages.css';

function AllMessages({ messages }){
  return(
    <ScrollToBottom className="messages">
    {messages.map((message, i) => <div key={i}><AllMessage message={message} /></div>)}
    </ScrollToBottom>
  );
}

export default AllMessages;