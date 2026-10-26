import axiosClient from './axiosClient';

export const getProducts = () => axiosClient.get('/product/all');

export const getProductById = (id) => axiosClient.get(`/product/${id}`);

export const createProduct = (formData) => 
  axiosClient.post('/product/create', formData);

export const updateProduct = (id, formData) => 
  axiosClient.put(`/product/update/${id}`, formData);

export const deleteProduct = (id) => 
  axiosClient.delete(`/product/delete/${id}`);