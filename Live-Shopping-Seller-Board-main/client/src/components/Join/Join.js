import React, { useState } from 'react';
import { Link } from "react-router-dom";

import './Join.css';

export default function SignIn() {
  const regex = /[^0-9]/g;
  const [broadcastUrl, setBroadcastUrl] = useState('');

  return (
    <div className="joinOuterContainer">
      <div className="joinInnerContainer">
        <h1 className="heading">Auto-Chat-Classification-and-Answers-for-Live-Commerce</h1>
        <div>
          <input placeholder="BroadcastUrl" className="joinInput" type="text" onChange={(event) => setBroadcastUrl(event.target.value)} />
        </div>
        <Link onClick={e => (!broadcastUrl) ? e.preventDefault() : null} to={`/broadcast-info?broadcastId=${broadcastUrl.replace(regex, '')}`}>
          <button className={'button mt-20'} type="submit">Admin Program Start</button>
        </Link>
      </div>
    </div>
  );
}
