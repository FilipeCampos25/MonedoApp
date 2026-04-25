import { mockApiRequest } from '../mockApi';

const PLACEHOLDER_API_BASE_URL = 'http://SEU_BACKEND_AQUI';
const RUNTIME_API_BASE_URL =
  typeof process !== 'undefined' ? process.env.EXPO_PUBLIC_API_BASE_URL : '';

export const API_BASE_URL = RUNTIME_API_BASE_URL || PLACEHOLDER_API_BASE_URL;
export const USE_MOCK_API = API_BASE_URL === PLACEHOLDER_API_BASE_URL;

function buildHeaders(token, customHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function parseResponse(response) {
  return response.text().then((rawText) => {
    let data = null;

    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch (error) {
      data = rawText || null;
    }

    if (!response.ok) {
      const message =
        (data && typeof data === 'object' && (data.message || data.detail || data.error)) ||
        'Erro ao comunicar com o backend.';
      throw new Error(message);
    }

    return data;
  });
}

export function apiRequest(route, options = {}) {
  if (USE_MOCK_API) {
    return mockApiRequest(route, options);
  }

  const {
    method = 'GET',
    body,
    token = '',
    headers = {},
  } = options;

  return fetch(`${API_BASE_URL}${route}`, {
    method,
    headers: buildHeaders(token, headers),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }).then(parseResponse);
}
