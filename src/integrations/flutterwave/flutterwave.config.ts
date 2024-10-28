import axios from 'axios';

export const flutterwaveAxios = axios.create({
  baseURL: 'https://api.flutterwave.com/v3',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
  },
});

flutterwaveAxios.interceptors.request.use(
  (config) => {
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!config.headers.Authorization && secretKey) {
      config.headers.Authorization = `Bearer ${secretKey}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

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
