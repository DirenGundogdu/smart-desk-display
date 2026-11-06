import { createContext, ReactNode, useContext } from 'react';

import { useWeather } from '../hooks';
import { Weather } from './api';

// One fetch loop for the whole app; the theme needs sunrise/sunset too.
const WeatherContext = createContext<{ weather: Weather | null; error: string | null }>({ weather: null, error: null });

export function WeatherProvider({ children }: { children: ReactNode }) {
  return <WeatherContext.Provider value={useWeather()}>{children}</WeatherContext.Provider>;
}

export const useWeatherData = () => useContext(WeatherContext);
