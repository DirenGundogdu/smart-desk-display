import AsyncStorage from '@react-native-async-storage/async-storage';

import { FIXED_LOCATION, LOCATION_CACHE_MS } from '../config';

export type Place = { name: string; latitude: number; longitude: number };

export type Hour = { time: string; temp: number; code: number; isDay: boolean; rainChance: number };
export type Day = { date: string; max: number; min: number; code: number; rainChance: number };

export type Weather = {
  place: Place;
  fetchedAt: number;
  current: { temp: number; feelsLike: number; humidity: number; wind: number; code: number; isDay: boolean };
  // Today's sunrise/sunset as local "YYYY-MM-DDTHH:MM"; missing in caches from older versions.
  sun?: { rise: string; set: string };
  hourly: Hour[];
  daily: Day[];
};

const PLACE_KEY = 'place.v1';
const WEATHER_KEY = 'weather.v2';

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

// IP lookup instead of GPS: no permission prompt and no radio kept awake.
async function getPlace(): Promise<Place> {
  if (FIXED_LOCATION) return FIXED_LOCATION;

  const cached = await AsyncStorage.getItem(PLACE_KEY);
  if (cached) {
    const { place, at } = JSON.parse(cached) as { place: Place; at: number };
    if (Date.now() - at < LOCATION_CACHE_MS) return place;
  }

  const geo = await fetchJson('https://get.geojs.io/v1/ip/geo.json');
  const place: Place = {
    name: geo.city || geo.region || geo.country || 'Unknown',
    latitude: Number(geo.latitude),
    longitude: Number(geo.longitude),
  };
  await AsyncStorage.setItem(PLACE_KEY, JSON.stringify({ place, at: Date.now() }));
  return place;
}

export async function loadCachedWeather(): Promise<Weather | null> {
  const raw = await AsyncStorage.getItem(WEATHER_KEY);
  return raw ? (JSON.parse(raw) as Weather) : null;
}

export async function fetchWeather(): Promise<Weather> {
  const place = await getPlace();
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${place.latitude}&longitude=${place.longitude}` +
    '&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day' +
    '&hourly=temperature_2m,weather_code,is_day,precipitation_probability' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset' +
    '&timezone=auto&forecast_days=5';
  const d = await fetchJson(url);

  // Times are in the location's own timezone, so match on the "YYYY-MM-DDTHH" prefix
  // rather than the device clock.
  const nowHour: string = d.current.time.slice(0, 13);
  const start = Math.max(0, (d.hourly.time as string[]).findIndex((t) => t.startsWith(nowHour)));
  const hourly: Hour[] = [];
  for (let i = start; i < d.hourly.time.length && hourly.length < 24; i++) {
    hourly.push({
      time: d.hourly.time[i],
      temp: d.hourly.temperature_2m[i],
      code: d.hourly.weather_code[i],
      isDay: d.hourly.is_day[i] === 1,
      rainChance: d.hourly.precipitation_probability[i] ?? 0,
    });
  }

  const weather: Weather = {
    place,
    fetchedAt: Date.now(),
    current: {
      temp: d.current.temperature_2m,
      feelsLike: d.current.apparent_temperature,
      humidity: d.current.relative_humidity_2m,
      wind: d.current.wind_speed_10m,
      code: d.current.weather_code,
      isDay: d.current.is_day === 1,
    },
    sun: { rise: d.daily.sunrise[0], set: d.daily.sunset[0] },
    hourly,
    daily: (d.daily.time as string[]).map((date, i) => ({
      date,
      max: d.daily.temperature_2m_max[i],
      min: d.daily.temperature_2m_min[i],
      code: d.daily.weather_code[i],
      rainChance: d.daily.precipitation_probability_max[i] ?? 0,
    })),
  };
  await AsyncStorage.setItem(WEATHER_KEY, JSON.stringify(weather));
  return weather;
}
