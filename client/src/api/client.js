const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthToken = () => localStorage.getItem('auth_token');

const request = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token && !options.skipAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const api = {
  // Config
  getConfig: () => request('/api/config', { skipAuth: true }),

  // Auth
  register: (data) => request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true,
  }),
  
  login: (data) => request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true,
  }),
  
  getMe: () => request('/api/auth/me'),

  // Brands
  getBrands: () => request('/api/brands'),
  createBrand: (data) => request('/api/brands', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateBrand: (brandId, data) => request(`/api/brands/${brandId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  getBrandStats: (brandId, dateRange) => 
    request(`/api/brands/${brandId}/stats?dateRange=${dateRange}`),

  // Links
  getLinks: (brandId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/links/brand/${brandId}?${query}`);
  },
  createLink: (data) => request('/api/links', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  archiveLinks: (linkIds) => request('/api/links/archive', {
    method: 'POST',
    body: JSON.stringify({ linkIds }),
  }),
  getTopPerformers: (brandId, limit, dateRange) =>
    request(`/api/links/brand/${brandId}/top-performers?limit=${limit}&dateRange=${dateRange}`),
  getPerformanceData: (brandId, dateRange, metrics) =>
    request(`/api/links/brand/${brandId}/performance?dateRange=${dateRange}&metrics=${JSON.stringify(metrics)}`),

  // Clicks
  trackClick: (linkId) => request('/api/clicks/track', {
    method: 'POST',
    body: JSON.stringify({ linkId }),
  }),
  exportCSV: (brandId) => {
    const token = getAuthToken();
    window.open(`${API_URL}/api/clicks/export/${brandId}?token=${token}`, '_blank');
  },

  // Team Management
  getBrandMembers: (brandId) => request(`/api/team/brand/${brandId}/members`),
  addBrandMember: (brandId, email, role) => request(`/api/team/brand/${brandId}/members`, {
    method: 'POST',
    body: JSON.stringify({ email, role }),
  }),
  removeBrandMember: (brandId, memberId) => request(`/api/team/brand/${brandId}/members/${memberId}`, {
    method: 'DELETE',
  }),
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};
