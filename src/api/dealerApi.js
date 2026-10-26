import axiosClient from "./axiosClient";

// Fetch all dealer partnership requests
export const getDealers = () => axiosClient.get("/dealers/all");

// Approve a dealer request by ID
export const approveDealerRequest = (id) =>
  axiosClient.patch(`/dealers/${id}/approve`);

// Create a new dealer partnership application with text details and document files (FormData)
export const createDealerRequest = (formData) =>
  axiosClient.post("/dealers/create", formData);
