import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté au chargement
    const token = authService.getToken();
    const userRole = authService.getUserRole();

    if (token && userRole) {
      setUser({
        token,
        role: userRole,
        isAuthenticated: true,
        isAdmin: userRole === "admin",
      });
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { token, role } = await authService.login(email, password);

      const userData = {
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
      // Envoyer toutes les données utilisateur au service
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

// Export par défaut pour compatibilité
export default AuthProvider;
