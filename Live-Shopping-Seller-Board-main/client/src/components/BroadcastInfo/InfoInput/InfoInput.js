import React from 'react';

import './InfoInput.css';

const InfoInput = ({ type, setInfo, info }) => {

    const placeholder = `Please enter the information of ${type}`
    
    return (
    <textarea
      className="input"
      type="text"
      placeholder={placeholder}
      value={info}
      onChange={({ target: { value } }) => setInfo(value)}
    />
);}

export default InfoInput;