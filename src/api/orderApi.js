import axiosClient from "./axiosClient";

export const getOrders = () => axiosClient.get("/order/all");
export const createOrder = (orderData) =>
  axiosClient.post("/order/create", orderData);
export const updateOrderStatus = (id, status) =>
  axiosClient.patch(`/order/${id}/status`, { status });
