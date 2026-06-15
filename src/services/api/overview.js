import { apiRequest } from './client';
import { API_ROUTES } from './routes';

export function getStudiesOverview(token) {
  return apiRequest(API_ROUTES.STUDIES_OVERVIEW, {
    method: 'GET',
    token,
  });
}

export function getGoalsOverview(token) {
  return apiRequest(API_ROUTES.GOALS_OVERVIEW, {
    method: 'GET',
    token,
  });
}

export function getFormOptions(token) {
  return apiRequest(API_ROUTES.FORM_OPTIONS, {
    method: 'GET',
    token,
  });
}
