// src/api/auth.js
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const login = async (username, password) => {
  const response = await axios.post(`${API_BASE_URL}/login/`, {
    username,
    password
  }, {
    withCredentials: true
  });
  return response.data;
};

export const logout = async () => {
  await axios.post(`${API_BASE_URL}/logout/`, {}, {
    withCredentials: true
  });
};

export const getCurrentUser = async () => {
  const response = await axios.get(`${API_BASE_URL}/whoami/`, {
    withCredentials: true
  });
  return response.data.user;
};