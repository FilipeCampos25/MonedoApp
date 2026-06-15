import { useState } from 'react';
import { Alert } from 'react-native';

import {
  createActivity,
  getFormOptions,
  getGoalsOverview,
  getStudiesOverview,
  loginRequest,
} from '../services/api';
import {
  createEmptyGoalsState,
  createEmptyStudiesState,
  extractToken,
  normalizeFormOptions,
  normalizeGoalsResponse,
  normalizeStudiesResponse,
} from '../utils/normalizers';

export function useAppController() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [currentScreen, setCurrentScreen] = useState('login');
  const [previousScreen, setPreviousScreen] = useState('studies');
  const [studiesData, setStudiesData] = useState(createEmptyStudiesState());
  const [goalsData, setGoalsData] = useState(createEmptyGoalsState());
  const [formOptions, setFormOptions] = useState({
    categories: [],
    priorities: [],
  });

  const loadApplicationData = async (token) => {
    const [studiesResponse, goalsResponse, formOptionsResponse] = await Promise.all([
      getStudiesOverview(token),
      getGoalsOverview(token),
      getFormOptions(token),
    ]);

    setStudiesData(normalizeStudiesResponse(studiesResponse));
    setGoalsData(normalizeGoalsResponse(goalsResponse));
    setFormOptions(normalizeFormOptions(formOptionsResponse));
  };

  const handleLogin = async ({ email, password }) => {
    try {
      const loginResponse = await loginRequest({
        email,
        password,
      });

      const token = extractToken(loginResponse);

      setAuthToken(token);
      setLoggedIn(true);
      setCurrentScreen('studies');

      await loadApplicationData(token);
    } catch (error) {
      Alert.alert(
        'Erro no login',
        error.message || 'N\u00e3o foi poss\u00edvel realizar o login.',
      );
    }
  };

  const openAddScreen = (origin) => {
    setPreviousScreen(origin);
    setCurrentScreen('add');
  };

  const handleSaveItem = async (form) => {
    const title = form.title.trim();
    const date = form.date.trim();
    const priority = form.priority.trim();

    if (!title || !date || !priority) {
      Alert.alert(
        'Campos obrigat\u00f3rios',
        'Preencha t\u00edtulo, data e prioridade.',
      );
      return;
    }

    try {
      await createActivity(authToken, {
        title: form.title,
        date: form.date,
        hour: form.hour,
        category: form.category,
        priority: form.priority,
        description: form.description,
      });

      await loadApplicationData(authToken);
      setCurrentScreen(previousScreen || 'studies');
    } catch (error) {
      Alert.alert(
        'Erro ao salvar',
        error.message || 'N\u00e3o foi poss\u00edvel salvar a atividade.',
      );
    }
  };

  return {
    currentScreen,
    formOptions,
    goalsData,
    handleLogin,
    handleSaveItem,
    loggedIn,
    openAddFromGoals: () => openAddScreen('goals'),
    openAddFromStudies: () => openAddScreen('studies'),
    returnToPreviousScreen: () => setCurrentScreen(previousScreen || 'studies'),
    studiesData,
    goToGoals: () => setCurrentScreen('goals'),
    goToStudies: () => setCurrentScreen('studies'),
  };
}
