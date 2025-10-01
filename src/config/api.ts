// API Configuration


export const API_BASE_URL = 'https://resources.bylinelms.com/api';
// export const API_BASE_URL = 'http://localhost:5000/api';


export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  VERIFY_TOKEN: `${API_BASE_URL}/auth/verify`,
  
  // User endpoints
  USERS: `${API_BASE_URL}/auth/admin/users`,
  USER_PROFILE: `${API_BASE_URL}/auth/profile`,
  USER_BY_ID: (id: number) => `${API_BASE_URL}/auth/admin/users/${id}`,
  
  // Admin dashboard endpoints
  DASHBOARD_STATS: `${API_BASE_URL}/admin/dashboard`,
  
  // Resource endpoints
  RESOURCES: `${API_BASE_URL}/resources`,
  RESOURCES_ALL: `${API_BASE_URL}/resources/all`,
  RESOURCES_POPULAR: `${API_BASE_URL}/resources/popular`,
  RESOURCE_BY_ID: (id: number) => `${API_BASE_URL}/resources/${id}`,
  RESOURCE_DOWNLOAD: (id: number) => `${API_BASE_URL}/resources/${id}/download`,
  RESOURCE_VIEW: (id: number) => `${API_BASE_URL}/resources/${id}/view`,
  RESOURCE_LIKE: (id: number) => `${API_BASE_URL}/resources/${id}/like`,
  RESOURCES_REORDER: `${API_BASE_URL}/resources/reorder`,
  USER_RESOURCES: `${API_BASE_URL}/resources/user/my-resources`,
  
  // Metadata endpoints
  GRADES: `${API_BASE_URL}/meta/grades`,
  SUBJECTS: `${API_BASE_URL}/meta/subjects`,
  RESOURCE_TYPES: `${API_BASE_URL}/meta/resource-types`,
  TAGS: `${API_BASE_URL}/meta/tags`,
  
  // File uploads
  UPLOAD_RESOURCE: `${API_BASE_URL}/resources`,
  UPLOAD_PREVIEW_IMAGE: `${API_BASE_URL}/upload/preview-image`,
  
  // Activity log endpoints
  ACTIVITY_LOGS: `${API_BASE_URL}/admin/activity/logs`,
  ACTIVITY_DATA: `${API_BASE_URL}/admin/activity/data`,
  ACTIVITY_SCHOOL_DOWNLOADS: `${API_BASE_URL}/admin/activity/school-downloads`,
  ACTIVITY_SUMMARY: `${API_BASE_URL}/admin/activity/summary`,
};

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  RETRY_ATTEMPTS: 3,
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to get file URL
export const getFileUrl = (filePath: string): string => {
  if (!filePath) return '';
  
  console.log('getFileUrl input:', filePath);
  
  // If already a full URL
  if (/^https?:\/\//i.test(filePath)) {
    console.log('Already a full URL:', filePath);
    return filePath;
  }

  // Normalize Windows backslashes to forward slashes and trim whitespace
  let normalized = filePath.replace(/\\/g, '/').trim();

  // Remove leading './' or '/'
  normalized = normalized.replace(/^\.\//, '');
  normalized = normalized.replace(/^\/+/, '');

  // Handle backend/uploads/ prefix - remove backend/ part
  if (normalized.startsWith('backend/uploads/')) {
    normalized = normalized.replace('backend/', '');
    console.log('Removed backend/ prefix, normalized:', normalized);
  }

  // Ensure the path starts with 'uploads/' if it doesn't already
  if (!normalized.startsWith('uploads/')) {
    normalized = 'uploads/' + normalized;
    console.log('Added uploads/ prefix, normalized:', normalized);
  }

  // Ensure no double slashes
  normalized = normalized.replace(/\/+/g, '/');

  // Remove /api from the base URL for static file paths
  const baseUrl = API_BASE_URL.replace('/api', '');
  const separator = baseUrl.endsWith('/') ? '' : '/';
  const finalUrl = `${baseUrl}${separator}${normalized}`;
  
  console.log('getFileUrl output:', finalUrl);
  return finalUrl;
};
