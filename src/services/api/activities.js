import { apiRequest } from './client';
import { API_ROUTES } from './routes';

export function createActivity(token, payload) {
  return apiRequest(API_ROUTES.CREATE_ACTIVITY, {
    method: 'POST',
    token,
    body: payload,
  });
}
