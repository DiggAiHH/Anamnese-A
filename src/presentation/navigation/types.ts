/**
 * Navigation Type Definitions
 * React Navigation - Root Stack
 */

import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';

/**
 * Root Stack Parameter List
 * Defines all screens and their parameters
 */
export type RootStackParamList = {
  Home: undefined;
  PatientInfo: undefined;
  Questionnaire: {
    questionnaireId: string;
  };
};

/**
 * Navigation prop types for each screen
 */
export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type PatientInfoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PatientInfo'>;
export type QuestionnaireScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Questionnaire'>;

/**
 * Route prop types for each screen
 */
export type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;
export type PatientInfoScreenRouteProp = RouteProp<RootStackParamList, 'PatientInfo'>;
export type QuestionnaireScreenRouteProp = RouteProp<RootStackParamList, 'Questionnaire'>;
