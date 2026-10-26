import axiosClient from './axiosClient';

export const getOrders = () => axiosClient.get('/order'); //[cite: 3]
export const createOrder = (orderData) => axiosClient.post('/order', orderData);
export const updateOrderStatus = (id, status) => axiosClient.patch(`/order/${id}`, { status });