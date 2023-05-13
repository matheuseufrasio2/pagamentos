import axios from "axios";

export const api = axios.create({
  baseURL: 'https://api-xml-math.onrender.com'
})