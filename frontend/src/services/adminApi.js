import axios from "axios";
import { getAdminAccessToken, clearAdminAccessToken } from "./tokenStore";

// Separate axios instance for admin requests. No refresh-token flow here
// (backend has no /admin/refresh route or refresh cookie for admin) — so
// on a 401, we just clear the admin session and let the app redirect to
// /admin/login. Access token lives for 1 day (as set in loginAdmin), so
// admin will need to log in again once a day. Fine for now, minimal effort.
const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

adminApi.interceptors.request.use((config) => {
  const token = getAdminAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAdminAccessToken();
      window.dispatchEvent(new Event("admin-session-expired"));
    }
    return Promise.reject(error);
  }
);

export default adminApi;