import axios from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "./tokenStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // sends the httpOnly refresh token cookie automatically
});

// Attach access token from memory on every request
api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Refresh control — prevents multiple simultaneous /auth/refresh calls
// when several requests 401 at the same time
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

// URLs that should never trigger the refresh flow — a 401 here means
// "wrong credentials" or "refresh token itself is dead", not "access
// token expired mid-session"
const SKIP_REFRESH_URLS = ["/auth/refresh", "/auth/login", "/auth/register"];

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // error.config can be undefined (network errors, cancelled requests)
    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !SKIP_REFRESH_URLS.includes(originalRequest.url)
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // a refresh is already in flight — queue this request and
        // retry it once the in-flight refresh resolves
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        // cookie is sent automatically — no body needed
        const res = await api.post("/auth/refresh");

        const newToken =
          res.data.accessToken || res.data.data?.accessToken;

        // backend rotates the refresh token too; it's reset as a new
        // httpOnly cookie by the server response itself, nothing to
        // do here for that half — we only need to store the new
        // access token in memory
        setAccessToken(newToken);

        processQueue(null);

        return api(originalRequest);
      } catch (err) {
        // refresh token cookie is dead/expired (past the 7 day window,
        // or was never valid) — force a full logout
        processQueue(err);
        clearAccessToken();
        window.dispatchEvent(new Event("session-expired"));
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
