import axiosClient from "./axiosClient";

// Website / Customer order & payment operations
export const createOrder = (orderData) =>
  axiosClient.post("/order/create", orderData);

export const getMyOrders = () => 
  axiosClient.get("/order/my-orders");

export const removeOrderItem = (orderId, itemId) =>
  axiosClient.delete(`/orders/${orderId}/item/${itemId}`);

export const createPaymentOrder = (payload) =>
  axiosClient.post("/payment/create-order", payload);

export const verifyPayment = (paymentData) =>
  axiosClient.post("/payment/verify-payment", paymentData);

// Admin & Cashier dashboard order operations
export const getOrders = (params = {}) => 
  axiosClient.get("/order/all", { params });

export const updateOrderStatus = (id, status) =>
  axiosClient.patch(`/order/${id}/status`, { status });

export const updatePaymentStatus = (id, paymentStatus, bankReference = '') =>
  axiosClient.patch(`/order/${id}/payment-status`, { paymentStatus, bankReference });
