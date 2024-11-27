import React from 'react';

import ScrollToBottom from 'react-scroll-to-bottom';

import Product from '../Products/Product/Product';

import './Products.css';

const Products = ({ products }) => (
  <ScrollToBottom className="products">
    {products.map((product, i) => <div key={i}><Product product={product}/></div>)}
  </ScrollToBottom>
);

export default Products;