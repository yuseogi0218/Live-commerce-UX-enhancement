import React from 'react';
import Spinner from '../../icons/Spinner.gif';

import './Loading.css';

export default ({info}) => {
  return (
    <div className='Background'>
      <div className='LoadingText'>{info}</div>
      <div className='LoadingText'>Please wait a moment.</div>
      <img src={Spinner} alt="로딩중" width="40%" />
    </div>
  );
};