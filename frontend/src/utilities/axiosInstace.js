// utils/axiosInstance.js
import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = `${import.meta.env.VITE_SERVER_URL}/api`;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Request interceptor - just add the right token
axiosInstance.interceptors.request.use((config) => {
  if (config.authType === "admin") {
    const token = Cookies.get("admin-auth-token");
    console.log("Admin token found:", token ? "YES" : "NO");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Added admin auth header");
    }
  } else if (config.authType === "student") {
    const token = Cookies.get("auth-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else if (config.authType === "photographer") {
    const token = Cookies.get("photographer-auth-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  // If authType is 'noAuth' or undefined, no token is added
  return config;
});

// Response interceptor - handle failures with simple redirects
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("Response interceptor triggered:", error.response?.status);
    
    // Handle authentication errors (401, 403) and inactive account errors (600, 601)
    const isAuthError = error.response?.status === 401 || error.response?.status === 403;
    const isInactiveAccount = error.response?.data?.status === 600 || error.response?.data?.status === 601;
    
    if (isAuthError || isInactiveAccount) {
      const originalRequest = error.config;
      console.log("Auth error detected, authType:", originalRequest.authType);
      
      if (isInactiveAccount) {
        console.log("Account is inactive, logging out user");
      }

      // Clear the appropriate token and redirect
      if (originalRequest.authType === "admin") {
        console.log("Clearing admin token and redirecting...");
        Cookies.remove("admin-auth-token");
        if (!originalRequest?.skipRedirect) {
          window.location.href = "/dashboard/login";
        }
      } else if (originalRequest.authType === "student") {
        Cookies.remove("auth-token");
        if (!originalRequest?.skipRedirect) {
          window.location.href = "/login";
        }
      } else if (originalRequest.authType === "photographer") {
        Cookies.remove("photographer-auth-token");
        if (!originalRequest?.skipRedirect) {
          window.location.href = "/phlogin";
        }
      }
      // If no authType, do nothing (public request failed)
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
