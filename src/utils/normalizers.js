import {
  asNumber,
  asString,
  formatCurrentDateLabel,
  getPayload,
  normalizePercent,
} from './base';

export function extractToken(loginResponse) {
  const payload = getPayload(loginResponse);

  return (
    payload.access_token ||
    payload.accessToken ||
    payload.token ||
    payload.jwt ||
    payload.auth_token ||
    ''
  );
}

export function createEmptyStudiesState() {
  return {
    todayLabel: formatCurrentDateLabel(),
    hoursToday: '\u2014',
    hoursGoalLabel: '',
    sessions: '\u2014',
    sessionsHelperText: '',
    weekTotalText: '',
    chartData: [],
    subjectProgress: [],
    activities: [],
  };
}

export function createEmptyGoalsState() {
  return {
    weeklyGoal: '\u2014',
    weeklyHelperText: '',
    dailyGoal: '\u2014',
    dailyHelperText: '',
    disciplines: '\u2014',
    disciplinesHelperText: '',
    progressSections: [],
  };
}

export function normalizeStudiesResponse(response) {
  const payload = getPayload(response);

  const chartSource =
    payload.chart_data ||
    payload.chartData ||
    payload.week_chart ||
    payload.weekChart ||
    [];

  const progressSource =
    payload.subject_progress ||
    payload.subjectProgress ||
    payload.progress ||
    [];

  const activitiesSource =
    payload.activities ||
    payload.upcoming_activities ||
    payload.upcomingActivities ||
    [];

  const normalizedChart = Array.isArray(chartSource)
    ? chartSource.map((item, index) => ({
        day: asString(item.day || item.label || item.name || `D${index + 1}`),
        value: asNumber(item.value || item.hours || item.total || 0, 0),
      }))
    : [];

  const calculatedWeekTotal = normalizedChart.reduce(
    (acc, item) => acc + asNumber(item.value, 0),
    0,
  );

  return {
    todayLabel: asString(payload.today_label || payload.todayLabel, formatCurrentDateLabel()),
    hoursToday: asString(payload.hours_today || payload.hoursToday, '\u2014'),
    hoursGoalLabel: asString(payload.hours_goal_label || payload.hoursGoalLabel, ''),
    sessions: asString(payload.sessions, '\u2014'),
    sessionsHelperText: asString(
      payload.sessions_helper_text || payload.sessionsHelperText,
      '',
    ),
    weekTotalText: asString(
      payload.week_total_text || payload.weekTotalText,
      calculatedWeekTotal > 0 ? `Total: ${calculatedWeekTotal} horas esta semana` : '',
    ),
    chartData: normalizedChart,
    subjectProgress: Array.isArray(progressSource)
      ? progressSource.map((item, index) => ({
          id: asString(item.id, String(index + 1)),
          label: asString(item.label || item.name || item.subject, ''),
          percent: normalizePercent(item.percent || item.progress || item.value || 0),
        }))
      : [],
    activities: Array.isArray(activitiesSource)
      ? activitiesSource.map((item, index) => ({
          id: asString(item.id, String(index + 1)),
          title: asString(item.title || item.name, ''),
          dateLabel: asString(item.dateLabel || item.date_label || item.date || ''),
          priority: asString(item.priority || '', '').trim().toLowerCase(),
        }))
      : [],
  };
}

export function normalizeGoalsResponse(response) {
  const payload = getPayload(response);

  const progressSource =
    payload.progress_sections ||
    payload.progressSections ||
    payload.progress ||
    payload.general_progress ||
    [];

  let normalizedProgress = [];

  if (Array.isArray(progressSource) && progressSource.length > 0) {
    normalizedProgress = progressSource.map((item, index) => ({
      id: asString(item.id, String(index + 1)),
      label: asString(item.label || item.name, ''),
      percent: normalizePercent(item.percent || item.progress || item.value || 0),
    }));
  } else {
    normalizedProgress = [
      {
        id: '1',
        label: 'Semana atual',
        percent: normalizePercent(payload.week_percent || payload.weekPercent || 0),
      },
      {
        id: '2',
        label: 'M\u00eas atual',
        percent: normalizePercent(payload.month_percent || payload.monthPercent || 0),
      },
    ].filter((item) => item.percent > 0);
  }

  return {
    weeklyGoal: asString(payload.weekly_goal || payload.weeklyGoal, '\u2014'),
    weeklyHelperText: asString(
      payload.weekly_helper_text || payload.weeklyHelperText,
      '',
    ),
    dailyGoal: asString(payload.daily_goal || payload.dailyGoal, '\u2014'),
    dailyHelperText: asString(
      payload.daily_helper_text || payload.dailyHelperText,
      '',
    ),
    disciplines: asString(payload.disciplines, '\u2014'),
    disciplinesHelperText: asString(
      payload.disciplines_helper_text || payload.disciplinesHelperText,
      '',
    ),
    progressSections: normalizedProgress,
  };
}

export function normalizeFormOptions(response) {
  const payload = getPayload(response);

  const categories = Array.isArray(payload.categories)
    ? payload.categories.map((item) => asString(item))
    : [];

  const priorities = Array.isArray(payload.priorities)
    ? payload.priorities.map((item) => asString(item))
    : [];

  return {
    categories,
    priorities,
  };
}
