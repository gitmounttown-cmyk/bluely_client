import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5008/api", // Update port if your backend runs elsewhere
});

axiosClient.interceptors.request.use(
  (config) => {
    // If sending FormData, delete Content-Type so the browser automatically sets the multipart boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;