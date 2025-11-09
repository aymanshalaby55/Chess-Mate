import axios from 'axios';

let parsedToken = null;

if (typeof window !== 'undefined') {
  const user = localStorage.getItem('user');
  parsedToken = user ? JSON.parse(user)?.token : null;
}

const api = axios.create({
  baseURL: 'http://localhost:4040/api',
  withCredentials: true,
  headers: {
    Authorization: parsedToken ? `Bearer ${parsedToken}` : undefined,
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication error:', error);
    }
    return Promise.reject(error);
  }
);

export default api;
