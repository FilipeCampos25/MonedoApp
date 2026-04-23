import { apiRequest } from './client';
import { API_ROUTES } from './routes';

export function loginRequest(credentials) {
  return apiRequest(API_ROUTES.AUTH_LOGIN, {
    method: 'POST',
    body: credentials,
  });
}
