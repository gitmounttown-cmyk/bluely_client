
import axiosClient from "./axiosClient";

// GET: Fetch all categories
export const getCategories = () =>
  axiosClient.get("/categories/all");

// GET: Fetch a single category by ID
export const getCategoryById = (id) =>
  axiosClient.get(`/categories/${id}`);

// POST: Create a category
export const createCategory = (data) =>
  axiosClient.post("/categories/create", data);

// PUT: Update a category
export const updateCategory = (id, data) =>
  axiosClient.put(`/categories/update/${id}`, data);

// DELETE: Delete a category
export const deleteCategory = (id) =>
  axiosClient.delete(`/categories/delete/${id}`);
