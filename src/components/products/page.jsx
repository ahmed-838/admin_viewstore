"use client";

import React from 'react';
import AddProduct from './AddProduct';
import UpdateProduct from './UpdateProduct';

const AddProductPage = () => {
  return (
    <div >
      <AddProduct />
    </div>
  );
}

const UpdateProductPage = () => {
  return (
    <div  >
      <UpdateProduct />
    </div>
  );
}

export { AddProductPage, UpdateProductPage }; 