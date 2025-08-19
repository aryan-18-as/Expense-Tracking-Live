import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 60000, // 60s, helps avoid 'Network Error' on big PDFs
});

export default api;
