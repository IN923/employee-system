import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

axiosClient.interceptors.request.use((config) => {
  const authEndpoints = [
    "api/token/",
    "api/token/refresh/",
    "api/token/verify/",
    "api/login/",
  ]

  if (authEndpoints.includes(config.url)) {
    return config;
  }

  const accessToken = localStorage.getItem("access")
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
})

export default axiosClient;