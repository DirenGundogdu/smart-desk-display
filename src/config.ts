// Set a fixed place to skip IP-based location, e.g.
// { name: 'Istanbul', latitude: 41.01, longitude: 28.98 }
export const FIXED_LOCATION: { name: string; latitude: number; longitude: number } | null = null;

// How often weather is refreshed while the app is open.
export const WEATHER_REFRESH_MS = 30 * 60 * 1000;

// The detected location is cached this long before asking again.
export const LOCATION_CACHE_MS = 24 * 60 * 60 * 1000;

// Second hand costs one redraw per second; without it the clock redraws once a minute.
export const SHOW_SECONDS = true;

// 'auto' switches to the dark theme between sunset and sunrise.
export const THEME: 'auto' | 'light' | 'dark' = 'auto';

// Starting art direction; long-press a screen's label (HOME / 01, FIELDNOTES) to switch.
export const DEFAULT_DESIGN: 'studio' | 'fieldnotes' = 'studio';

// Endpoints shown on the health screen. Replace with your own services.
export const SERVICES: { name: string; url: string }[] = [
  { name: 'Weather API', url: 'https://api.open-meteo.com/v1/forecast?latitude=41&longitude=29&current=temperature_2m' },
  { name: 'Geo IP', url: 'https://get.geojs.io/v1/ip.json' },
  { name: 'GitHub API', url: 'https://api.github.com' },
  { name: 'Expo', url: 'https://expo.dev' },
  { name: 'Internet', url: 'https://www.google.com/generate_204' },
];

// Health checks run this often, only while the health screen is showing.
export const HEALTH_INTERVAL_MS = 60 * 1000;

// Responses slower than this count as SLOW.
export const SLOW_MS = 300;
