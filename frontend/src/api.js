import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV
      ? "http://localhost:5002"
      : "https://quick-notes-backend-ygmq.onrender.com"),
});

export default API;
