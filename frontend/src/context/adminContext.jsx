import { createContext, useContext, useState, useEffect, useCallback } from "react";
import adminApi from "../services/adminApi";
import { setAdminAccessToken, clearAdminAccessToken } from "../services/tokenStore";

const AdminContext = createContext(null);

/**
 * Fully separate from AuthContext (buyer/seller): different token slot
 * (adminAccessToken, not accessToken), different axios instance (adminApi),
 * and no refresh-token flow — the backend doesn't have one for admins yet.
 * The 1-day access token simply expires and the admin logs in again;
 * an "admin-session-expired" event (dispatched by adminApi on 401) clears
 * local state so the UI reacts immediately instead of waiting for the
 * next failed request.
 */
export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get("/admin/profile");
      setAdmin(res.data?.data || null);
    } catch (err) {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();

    const handleExpire = () => {
      setAdmin(null);
      clearAdminAccessToken();
    };
    window.addEventListener("admin-session-expired", handleExpire);
    return () => window.removeEventListener("admin-session-expired", handleExpire);
  }, [fetchProfile]);

  const login = useCallback(async (credentials) => {
    const res = await adminApi.post("/admin/login", credentials);
    const token = res.data?.accessToken;
    const adminData = res.data?.data;
    if (token) setAdminAccessToken(token);
    setAdmin(adminData || null);
    return adminData;
  }, []);

  // No /admin/logout endpoint exists — clear client-side session only.
  const logout = useCallback(() => {
    clearAdminAccessToken();
    setAdmin(null);
  }, []);

  return (
    <AdminContext.Provider
      value={{ admin, isLoggedIn: !!admin, loading, login, logout, refreshAdmin: fetchProfile }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return ctx;
};