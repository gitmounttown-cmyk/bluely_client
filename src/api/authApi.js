import axiosClient from './axiosClient';

export const loginUser = (credentials) => axiosClient.post('/users/login', credentials);
export const registerUser = (userData) => axiosClient.post('/users/register', userData);
export const getProfile = () => axiosClient.get('/users/profile');