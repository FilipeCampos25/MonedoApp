import { API_ROUTES } from './api/routes';

export const MOCK_CREDENTIALS = {
  email: 'demo@atlas.app',
  password: 'atlas123',
};

const MOCK_TOKEN = 'mock-access-token';

const INITIAL_FORM_OPTIONS = {
  categories: ['Estudos', 'Trabalho', 'Projeto', 'Revisao'],
  priorities: ['Alta', 'Media', 'Baixa'],
};

function formatHours(value) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 1,
  });
}

function formatTodayLabel() {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
  });
}

function createStudiesState() {
  return {
    hoursToday: 4.5,
    hoursGoal: 6,
    chartData: [
      { day: 'Seg', value: 2.0 },
      { day: 'Ter', value: 3.2 },
      { day: 'Qua', value: 2.8 },
      { day: 'Qui', value: 4.1 },
      { day: 'Sex', value: 3.4 },
      { day: 'Sab', value: 1.6 },
      { day: 'Dom', value: 4.5 },
    ],
    subjectProgress: [
      { id: 'math', label: 'Matematica', percent: 72 },
      { id: 'physics', label: 'Fisica', percent: 58 },
      { id: 'history', label: 'Historia', percent: 84 },
    ],
    activities: [
      {
        id: 'activity-1',
        title: 'Revisao de algebra linear',
        dateLabel: 'Hoje - 19:00',
        priority: 'alta',
      },
      {
        id: 'activity-2',
        title: 'Lista de exercicios de fisica',
        dateLabel: '25/04 - 08:30',
        priority: 'media',
      },
      {
        id: 'activity-3',
        title: 'Resumo da aula de historia',
        dateLabel: '25/04 - 14:00',
        priority: 'baixa',
      },
      {
        id: 'activity-4',
        title: 'Simulado de raciocinio logico',
        dateLabel: '26/04 - 10:00',
        priority: 'alta',
      },
      {
        id: 'activity-5',
        title: 'Planejar semana de estudos',
        dateLabel: '27/04 - 18:30',
        priority: 'media',
      },
    ],
  };
}

function createGoalsState() {
  return {
    weekly_goal: '24 horas',
    weekly_helper_text: 'Faltam 8,4 horas para fechar a meta da semana.',
    daily_goal: '4h',
    daily_helper_text: 'Media dos ultimos 7 dias: 3,1h',
    disciplines: '6',
    disciplines_helper_text: '3 disciplinas com progresso acima de 70%',
    progress_sections: [
      { id: 'week', label: 'Semana atual', percent: 65 },
      { id: 'month', label: 'Mes atual', percent: 48 },
      { id: 'exam', label: 'Preparacao para prova', percent: 73 },
    ],
  };
}

function createMockStore() {
  return {
    user: {
      id: 'user-1',
      name: 'Usuario Demo',
      email: MOCK_CREDENTIALS.email,
    },
    studies: createStudiesState(),
    goals: createGoalsState(),
    formOptions: INITIAL_FORM_OPTIONS,
  };
}

let mockStore = createMockStore();

function ensureAuthorized(token) {
  if (token !== MOCK_TOKEN) {
    throw new Error('Sessao mock invalida. Entre novamente.');
  }
}

function buildStudiesOverview() {
  const weekTotal = mockStore.studies.chartData.reduce((total, item) => total + item.value, 0);
  const totalActivities = mockStore.studies.activities.length;

  return {
    today_label: formatTodayLabel(),
    hours_today: `${formatHours(mockStore.studies.hoursToday)}h`,
    hours_goal_label: `Meta diaria: ${formatHours(mockStore.studies.hoursGoal)}h`,
    sessions: String(totalActivities),
    sessions_helper_text: `${totalActivities} atividades planejadas`,
    week_total_text: `Total: ${formatHours(weekTotal)}h nesta semana`,
    chart_data: mockStore.studies.chartData,
    subject_progress: mockStore.studies.subjectProgress,
    activities: mockStore.studies.activities,
  };
}

function buildActivityDateLabel(payload) {
  const parts = [];

  if (payload.date) {
    parts.push(payload.date);
  }

  if (payload.hour) {
    parts.push(payload.hour);
  }

  if (payload.category) {
    parts.push(payload.category);
  }

  return parts.length > 0 ? parts.join(' - ') : 'Sem data definida';
}

function createMockActivity(payload = {}) {
  const normalizedPriority = String(payload.priority || 'media').trim().toLowerCase();

  return {
    id: `activity-${Date.now()}`,
    title: String(payload.title || 'Nova atividade').trim(),
    dateLabel: buildActivityDateLabel(payload),
    priority: normalizedPriority || 'media',
  };
}

function handleMockRequest(route, options = {}) {
  const { body = {}, token = '' } = options;

  switch (route) {
    case API_ROUTES.AUTH_LOGIN: {
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');

      if (
        email !== MOCK_CREDENTIALS.email.toLowerCase() ||
        password !== MOCK_CREDENTIALS.password
      ) {
        throw new Error('Use o usuario mock configurado para entrar.');
      }

      return {
        access_token: MOCK_TOKEN,
        user: mockStore.user,
      };
    }

    case API_ROUTES.STUDIES_OVERVIEW:
      ensureAuthorized(token);
      return buildStudiesOverview();

    case API_ROUTES.GOALS_OVERVIEW:
      ensureAuthorized(token);
      return mockStore.goals;

    case API_ROUTES.FORM_OPTIONS:
      ensureAuthorized(token);
      return mockStore.formOptions;

    case API_ROUTES.CREATE_ACTIVITY: {
      ensureAuthorized(token);

      const newActivity = createMockActivity(body);
      mockStore = {
        ...mockStore,
        studies: {
          ...mockStore.studies,
          activities: [newActivity, ...mockStore.studies.activities],
        },
      };

      return {
        success: true,
        item: newActivity,
      };
    }

    default:
      throw new Error(`Rota mock nao implementada: ${route}`);
  }
}

export function mockApiRequest(route, options = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(handleMockRequest(route, options));
      } catch (error) {
        reject(error);
      }
    }, 120);
  });
}
