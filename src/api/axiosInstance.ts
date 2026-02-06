import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { getCookie, setCookie } from "@/lib/cookies";

// --- Helper to safely set Authorization header ---
function setAuthHeader(headers: any, token: string) {
  if ("set" in headers && typeof headers.set === "function") {
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    headers["Authorization"] = `Bearer ${token}`;
  }
}

// --- Axios instance ---
const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Request interceptor: attach token ---
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Try both cookie names for compatibility
    const token = getCookie("auth_token") || getCookie("authToken");
    if (token && config.headers) {
      setAuthHeader(config.headers, token);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// --- Token refresh handling ---
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers)
                setAuthHeader(originalRequest.headers, token);
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        // Try both cookie names for compatibility
        const refreshToken =
          getCookie("refresh_token") || getCookie("refreshToken");
        if (!refreshToken) throw new Error("No refresh token found");

        const { data } = await axios.post(
          "/api/auth/refresh",
          { refreshToken },
          { withCredentials: true },
        );

        const newToken = data?.authToken || data?.auth_token;
        if (!newToken) throw new Error("Failed to get new token");

        // Store token with underscore name to match backend
        setCookie("auth_token", newToken, 1);
        processQueue(null, newToken);

        if (originalRequest.headers)
          setAuthHeader(originalRequest.headers, newToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.error("Token refresh failed, logging out...");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
