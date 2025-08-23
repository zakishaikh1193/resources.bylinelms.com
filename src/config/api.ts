// API Configuration


const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://resources.bylinelms.com/api'
  : 'http://localhost:5000/api';


export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  VERIFY_TOKEN: `${API_BASE_URL}/auth/verify`,
  
  // User endpoints
  USERS: `${API_BASE_URL}/auth/admin/users`,
  USER_PROFILE: `${API_BASE_URL}/users/profile`,
  USER_BY_ID: (id: number) => `${API_BASE_URL}/auth/admin/users/${id}`,
  
  // Admin dashboard endpoints
  DASHBOARD_STATS: `${API_BASE_URL}/admin/dashboard`,
  
  // Resource endpoints
  RESOURCES: `${API_BASE_URL}/resources`,
  RESOURCES_ALL: `${API_BASE_URL}/resources/all`,
  RESOURCES_POPULAR: `${API_BASE_URL}/resources/popular`,
  RESOURCE_BY_ID: (id: number) => `${API_BASE_URL}/resources/${id}`,
  RESOURCE_DOWNLOAD: (id: number) => `${API_BASE_URL}/resources/${id}/download`,
  RESOURCE_LIKE: (id: number) => `${API_BASE_URL}/resources/${id}/like`,
  USER_RESOURCES: `${API_BASE_URL}/resources/user/my-resources`,
  
  // Metadata endpoints
  GRADES: `${API_BASE_URL}/meta/grades`,
  SUBJECTS: `${API_BASE_URL}/meta/subjects`,
  RESOURCE_TYPES: `${API_BASE_URL}/meta/resource-types`,
  TAGS: `${API_BASE_URL}/meta/tags`,
  
  // File uploads
  UPLOAD_RESOURCE: `${API_BASE_URL}/resources`,
  UPLOAD_PREVIEW_IMAGE: `${API_BASE_URL}/upload/preview-image`,
};

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to get file URL
export const getFileUrl = (filePath: string): string => {
  if (!filePath) return '';
  if (filePath.startsWith('http')) return filePath;
  
  // Remove /api from the base URL for file paths
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}/${filePath}`;
};
