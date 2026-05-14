const axios = require('axios');

// Create axios instance for external APIs
const createAxiosInstance = (baseURL, timeout = 30000) => {
  return axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'ShifaMart+ MERN Backend/1.0.0'
    }
  });
};

// Python AI API instance
const pythonAPI = createAxiosInstance(
  process.env.PYTHON_API_URL || 'http://localhost:8000',
  30000 // 30 seconds timeout for AI processing
);

// Interceptor for logging requests (development only)
if (process.env.NODE_ENV === 'development') {
  pythonAPI.interceptors.request.use(request => {
    console.log(`🐍 Python API Request: ${request.method?.toUpperCase()} ${request.baseURL}${request.url}`);
    return request;
  });
  
  pythonAPI.interceptors.response.use(
    response => {
      console.log(`🐍 Python API Response: ${response.status} ${response.statusText}`);
      return response;
    },
    error => {
      console.error(`🐍 Python API Error: ${error.message}`);
      if (error.response) {
        console.error(`Response Data:`, error.response.data);
        console.error(`Response Status:`, error.response.status);
      }
      return Promise.reject(error);
    }
  );
}

module.exports = {
  pythonAPI,
  createAxiosInstance
};