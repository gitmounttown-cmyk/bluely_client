import axiosClient from './axiosClient';

export const loginUser = (credentials) => axiosClient.post('/auth/login', credentials);
export const signupUser = (userData) => axiosClient.post('/auth/signup', userData);