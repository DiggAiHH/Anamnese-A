/**
 * Main App Entry Point für React Native
 * 
 * Setup:
 * - Navigation
 * - i18n
 * - Providers
 * - Error Boundary
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

// Components
import { ErrorBoundary } from './components/ErrorBoundary';

// Navigation
import { RootNavigator } from './navigation/RootNavigator';

// i18n
import './i18n/config';

// Database initialization
import { database } from '@infrastructure/persistence/DatabaseConnection';

const App = (): React.JSX.Element => {
  useEffect(() => {
    // Initialize database on app start
    const initializeApp = async (): Promise<void> => {
      try {
        await database.connect();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    void initializeApp();

    // Cleanup on unmount
    return () => {
      void database.close().catch((error: Error) => {
        console.error('Failed to close database:', error);
      });
    };
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
