// services/userService.js
import { authAPI } from "./api"; // Ton instance axios avec baseURL et token

const getUserById = async (id) => {
  const res = await authAPI.get(`/users/${id}`);
  return res.data;
};

const updateUser = async (id, data) => {
  const res = await authAPI.put(`/users/${id}`, data);
  return res.data;
};

export default {
  getUserById,
  updateUser,
};
