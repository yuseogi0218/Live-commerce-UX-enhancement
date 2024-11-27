import React from 'react';

import Chat from './components/Chat/Chat';
import BroadcastInfo from './components/BroadcastInfo/BroadcastInfo'
import Join from './components/Join/Join';
import Pong from './Pong';

import { BrowserRouter as Router, Route } from "react-router-dom";

const App = () => {
  return (
    <Router>
      <Route path="/" exact component={Join} />
      <Route path="/broadcast-info" component={BroadcastInfo} />
      <Route path="/chat" component={Chat} />
      <Route path="/ping" component={Pong} />
    </Router>
  );
}

export default App;
