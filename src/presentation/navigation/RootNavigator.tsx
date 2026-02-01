/**
 * Root Navigator - Stack Navigation
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { RootStackParamList } from './types';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { PatientInfoScreen } from '../screens/PatientInfoScreen';
import { QuestionnaireScreen } from '../screens/QuestionnaireScreen';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator = (): React.JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2563eb',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Anamnese' }}
      />
      <Stack.Screen
        name="PatientInfo"
        component={PatientInfoScreen}
        options={{ title: 'Patienteninformationen' }}
      />
      <Stack.Screen
        name="Questionnaire"
        component={QuestionnaireScreen}
        options={{ title: 'Fragebogen' }}
      />
    </Stack.Navigator>
  );
};
