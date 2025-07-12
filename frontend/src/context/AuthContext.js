import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authService.getToken();
    const role = authService.getUserRole();
    const id = localStorage.getItem("userId"); // 👈 correction ici (pas de getUserId)

    if (token && role && id) {
      setUser({
        id: parseInt(id, 10),
        token,
        role,
        isAuthenticated: true,
        isAdmin: role === "admin",
      });
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { token, role, id } = await authService.login(email, password);

      // Stocker dans le state
      const userData = {
        id,
        token,
        role,
        isAuthenticated: true,
        isAdmin: role === "admin",
      };

      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      await authService.register(userData);
      return { success: true, message: "Inscription réussie" };
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
