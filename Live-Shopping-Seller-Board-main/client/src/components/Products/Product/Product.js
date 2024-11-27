import React, { useState } from 'react';

import './Product.css';

import InfoInput from '../../BroadcastInfo/InfoInput/InfoInput'

const Product = ({ product }) => {

  function useCustomState(initialValue) {
    const [state, setState] = useState(initialValue);
  
    const customSetState = (newValue) => {
      setState(newValue);

      product.info = newValue;
    };
  
    return [state, customSetState];
  }

  const [productInfo, setProductInfo] = useCustomState('');

  return (
    (
      <div className="productContainer justifyStart">
        <div className="productBox backgroundLight">
          <p className="productName colorWhite">Product Name : {product.name}</p>

          <InfoInput type={product.name} setInfo={setProductInfo} info={productInfo} />
        </div>
      </div>
    )
  );
}

export default Product;