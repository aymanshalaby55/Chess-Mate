import axios from "axios";
// import dotenv from "dotenv";
// dotenv.config();

let parsedToken = null;

if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    parsedToken = user ? JSON.parse(user)?.token : null;
}

// const API_BASE_URL =
//   process.env.NODE_ENV === "development"
//     ? process.env.NEXT_PUBLIC_API_BASE_URL_LOCAL
//     : process.env.NEXT_PUBLIC_API_BASE_URL_REMOTE;

const api = axios.create({
    baseURL: "http://localhost:4040/api",
    withCredentials: true,
    headers: {
        Authorization: parsedToken ? `Bearer ${parsedToken}` : undefined,
    },
});

// Add a request interceptor to handle errors consistently
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle authentication errors or network errors
        if (error.response?.status === 401) {
            console.error("Authentication error:", error);
            // You could redirect to login page here if needed
        }
        return Promise.reject(error);
    },
);

export default api;
