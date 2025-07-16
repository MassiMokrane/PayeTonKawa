// services/userService.js
import { authAPI } from "./api"; // Ton instance axios avec baseURL et token

// Méthodes pour l'utilisateur connecté (pas besoin d'ID)
const getMyProfile = async () => {
  const res = await authAPI.get("/profile");
  return res.data;
};

const updateMyProfile = async (data) => {
  const res = await authAPI.put("/profile", data);
  return res.data;
};

// Méthodes admin (nécessitent un ID)
const getUserById = async (id) => {
  const res = await authAPI.get(`/users/${id}`);
  return res.data;
};

const updateUser = async (id, data) => {
  const res = await authAPI.put(`/users/${id}`, data);
  return res.data;
};

export default {
  getMyProfile,
  updateMyProfile,
  getUserById,
  updateUser,
};
