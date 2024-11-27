import React, {useState, useEffect} from 'react';
import io from "socket.io-client";

import {API} from './config';

let socket;

function Pong({  }){

    const [message, setMessage] = useState('');

    useEffect(() => {

      const ENDPOINT = `${API.NodeJS_URL}/ping`

      fetch(ENDPOINT)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log(response);
        
        return response.json();
      })
      .then(data => {
          console.log(data);
          setMessage(data["response"]);
      })
      .catch(error => {
        console.error("API 요청 오류:", error);
      });

    })

    useEffect(() => {
      const broadcastId  = '1125403';
      
      socket = io(API.NodeJS_URL);
  
      socket.emit('joinRoom', { broadcastId }, (error) => {
        if(error) {
          alert(error);
        }
      });
  
      socket.on('answer', message => {
        console.log(message);
      });

    }, []);

    useEffect(() => {
  
      socket.on('message', message => {
        console.log(message);
  
      });
    }, []);

    return(<div><div>{message}</div></div>);

}

export default Pong;
