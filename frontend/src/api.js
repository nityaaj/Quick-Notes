import axios from "axios";

const API = axios.create({
  baseURL: "https://quick-notes-backend-ygmq.onrender.com",
});

export default API;