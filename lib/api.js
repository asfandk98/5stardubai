import axios from "axios";

const API = axios.create({
  baseURL: "https://5stardubai.com/backend/api",
  withCredentials: false, // ✅ IMPORTANT
});

// ✅ attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;