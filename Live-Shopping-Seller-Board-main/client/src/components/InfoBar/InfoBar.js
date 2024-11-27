import React from 'react';

import './InfoBar.css';

const InfoBar = ({ intend }) => (
  <div className="infoBar">
    <div className="leftInnerContainer">
      <h1>{intend}</h1>
    </div>
  </div>
);

export default InfoBar;