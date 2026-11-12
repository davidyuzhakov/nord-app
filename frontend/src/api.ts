import axios from 'axios';
export const apiInstance = axios.create({
  withCredentials: true,
  baseURL: import.meta.env.DEV
    ? 'http://localhost:3000'
    : 'https://api.nord-app.ru',
});
