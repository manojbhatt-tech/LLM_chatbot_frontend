import axios from "axios";
import { toast } from "react-toastify";

// Set up common headers
const commonHeaders = () => {
  axios.defaults.baseURL = import.meta.env.VITE_API_ADMIN_BASE_URL;
  //   axios.defaults.headers.common["x-api-key"] = import.meta.env.VITE_LICENCE;
  axios.defaults.crossDomain = true;
  //   use this withCreadentioals when implement authentication
  axios.defaults.withCredentials = true;
};

// Handle unauthorized errors (401)
const handleUnauthorized = async (response) => {
  if (response.data.message?.includes("Invalid Login Credentials")) {
    toast.error(response.data.message);
    return Promise.reject(response.data.message);
  }

  toast.error("Session expired. Please login again.");
  localStorage.removeItem("isLoggedIn");
  window.location.href = "/login";
  return Promise.reject("Session expired");
};

// Global Axios response interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      return handleUnauthorized(error.response);
    }

    return Promise.reject(error);
  }
);

// Generic error handler
const errorHandler = (error) => {
  if (import.meta.env.VITE_LOG_ERRORS_IN_CONSOLE === "true") {
    console.error("API Error:", error);
  }

  if (error.response) {
    const { status, data } = error.response;

    if (status === 401) {
      handleUnauthorized(error.response);
    } else if (status === 404) {
      toast.error("Resource not found.");
    } else if (status >= 500) {
      toast.error(data?.message);
      toast.error(
        data?.error_message || "Server error. Please try again later."
      );
    } else if (status === 400) {
      toast.error(data?.message);
      toast.error(data?.error_message || "An error occurred.");
    } else {
      toast.error(data?.message || "An error occurred.");
    }
  } else if (error.request) {
    toast.error(
      "No response from the server. Please check your internet connection."
    );
  } else {
    toast.error("An error occurred while processing your request.");
  }

  return Promise.reject(error);
};

// Axios helper utility
const AxiosHelper = {
  getData: async (url, params = null, config = {}) => {
    commonHeaders();
    return axios.get(url, { params, ...config }).catch(errorHandler);
  },

  postData: async (url, data, isMultipart = false, config = {}) => {
    commonHeaders();
    const headers = isMultipart
      ? { "Content-Type": "multipart/form-data" }
      : { "Content-Type": "application/json" };

    return axios.post(url, data, { headers, ...config }).catch(errorHandler);
  },

  patchData: async (url, data, isMultipart = false, config = {}) => {
    commonHeaders();
    const headers = isMultipart
      ? { "Content-Type": "multipart/form-data" }
      : { "Content-Type": "application/json" };

    return axios.patch(url, data, { headers, ...config }).catch(errorHandler);
  },

  deleteData: async (url, config = {}) => {
    commonHeaders();
    return axios.delete(url, config).catch(errorHandler);
  },
};

export default AxiosHelper;
