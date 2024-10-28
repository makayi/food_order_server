import axios from 'axios';

export const flutterwaveAxios = axios.create({
  baseURL: 'https://api.flutterwave.com/v3',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to dynamically set the Authorization header
flutterwaveAxios.interceptors.request.use(
  (config) => {
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) {
      throw new Error(
        'FLUTTERWAVE_SECRET_KEY is not defined in environment variables',
      );
    }
    config.headers.Authorization = `Bearer ${secretKey}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
flutterwaveAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data,
    };
    return Promise.reject(customError);
  },
);
