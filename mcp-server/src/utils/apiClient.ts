import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.APEX_API_URL || 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.APEX_API_KEY || 'apex-internal-key'
  }
});

export default apiClient;
