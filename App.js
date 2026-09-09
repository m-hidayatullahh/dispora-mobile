import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from './src/theme';
import { I18nProvider } from './src/i18n/i18n';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <SafeAreaProvider>
            <ThemedStatusBar />
            <RootNavigator />
          </SafeAreaProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
