import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://department-digital-hub-a22.onrender.com/api',
  withCredentials: true,
});

export default API;