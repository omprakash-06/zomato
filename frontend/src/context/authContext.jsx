import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/axios";
import { setAccessToken, clearAccessToken } from "../services/tokenStore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/auth/profile");
      const userData = res.data?.data?.user;
      setUser(userData || null);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();

    const handleExpire = () => {
      setUser(null);
      clearAccessToken();
    };

    window.addEventListener("session-expired", handleExpire);

    return () =>
      window.removeEventListener("session-expired", handleExpire);
  }, [fetchProfile]);

  // LOGIN
  const login = useCallback(async (credentials) => {
    const res = await api.post("/auth/login", credentials);

    const token = res.data?.accessToken || res.data?.data?.accessToken;
    const userData = res.data?.data?.user;

    if (token) {
      setAccessToken(token);
    }
    console.log(userData)
    setUser(userData);

    return userData;
  }, []);

  // LOGOUT
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      clearAccessToken();
      setUser(null);
    }
  }, []);

  // LOGOUT ALL
  const logoutAll = useCallback(async () => {
    try {
      await api.post("/auth/logout/all");
    } finally {
      clearAccessToken();
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(() => {
    return fetchProfile();
  }, [fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        loading,
        login,
        logout,
        logoutAll,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
