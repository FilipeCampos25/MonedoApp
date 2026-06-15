import React from 'react';

import { useAppController } from './app/useAppController';
import { AddItemScreen } from './screens/AddItemScreen';
import { GoalsScreen } from './screens/GoalsScreen';
import { LoginScreen } from './screens/LoginScreen';
import { StudiesScreen } from './screens/StudiesScreen';

function App() {
  const {
    currentScreen,
    formOptions,
    goalsData,
    handleLogin,
    handleSaveItem,
    loggedIn,
    openAddFromGoals,
    openAddFromStudies,
    returnToPreviousScreen,
    studiesData,
    goToGoals,
    goToStudies,
  } = useAppController();

  if (!loggedIn || currentScreen === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (currentScreen === 'studies') {
    return (
      <StudiesScreen
        data={studiesData}
        onOpenAdd={openAddFromStudies}
        onOpenGoals={goToGoals}
      />
    );
  }

  if (currentScreen === 'goals') {
    return (
      <GoalsScreen
        data={goalsData}
        onOpenStudies={goToStudies}
        onOpenAdd={openAddFromGoals}
      />
    );
  }

  return (
    <AddItemScreen
      categories={formOptions.categories}
      priorities={formOptions.priorities}
      onBack={returnToPreviousScreen}
      onCancel={returnToPreviousScreen}
      onSave={handleSaveItem}
    />
  );
}

export default App;
