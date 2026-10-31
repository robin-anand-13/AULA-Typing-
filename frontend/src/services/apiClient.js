// Centralized API Client with anonymous visitor ID continuity
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export function getVisitorId() {
  let id = localStorage.getItem('visitor_id');
  if (!id) {
    id = 'v_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem('visitor_id', id);
  }
  return id;
}

export async function apiRequest(endpoint, options = {}) {
  const visitorId = getVisitorId();
  const headers = {
    'Content-Type': 'application/json',
    'X-Visitor-Id': visitorId,
    ...(options.headers || {})
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
