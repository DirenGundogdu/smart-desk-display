import { useFonts } from 'expo-font';
import { useKeepAwake } from 'expo-keep-awake';
import { NavigationBar } from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { ComponentType } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { DesignProvider, useDesign } from './src/design';
import { FNFocus } from './src/fieldnotes/FNFocus';
import { FNHealth } from './src/fieldnotes/FNHealth';
import { FNHome } from './src/fieldnotes/FNHome';
import { FNTodo } from './src/fieldnotes/FNTodo';
import { Pager } from './src/Pager';
import { Page } from './src/pager/context';
import { HealthScreen } from './src/screens/HealthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { PomodoroScreen } from './src/screens/PomodoroScreen';
import { TodoScreen } from './src/screens/TodoScreen';
import { FONTS, ThemeProvider } from './src/theme';
import { WeatherProvider } from './src/weather/WeatherContext';

// Each page in both art directions: [studio, fieldnotes].
const byDesign = (Studio: ComponentType, Fieldnotes: ComponentType) =>
  function Screen() {
    return useDesign().design === 'studio' ? <Studio /> : <Fieldnotes />;
  };

// Swipe left/right between these. Add new screens here.
const PAGES: Page[] = [
  { component: byDesign(HomeScreen, FNHome) },
  { component: byDesign(TodoScreen, FNTodo) },
  { component: byDesign(HealthScreen, FNHealth) },
  { component: byDesign(PomodoroScreen, FNFocus) },
];

export default function App() {
  useKeepAwake();
  const [fontsLoaded] = useFonts(FONTS);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar hidden />
      <NavigationBar hidden />
      {fontsLoaded && (
        <DesignProvider>
          <WeatherProvider>
            <ThemeProvider>
              <Pager pages={PAGES} />
            </ThemeProvider>
          </WeatherProvider>
        </DesignProvider>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1B1D2D' },
});
