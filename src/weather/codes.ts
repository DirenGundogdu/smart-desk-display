export type Sky = 'clear' | 'partly' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunder';

// WMO weather interpretation codes used by Open-Meteo.
const CODES: Record<number, [string, Sky]> = {
  0: ['Clear', 'clear'],
  1: ['Mostly clear', 'clear'],
  2: ['Partly cloudy', 'partly'],
  3: ['Overcast', 'cloudy'],
  45: ['Fog', 'fog'],
  48: ['Icy fog', 'fog'],
  51: ['Light drizzle', 'drizzle'],
  53: ['Drizzle', 'drizzle'],
  55: ['Heavy drizzle', 'drizzle'],
  56: ['Freezing drizzle', 'drizzle'],
  57: ['Freezing drizzle', 'drizzle'],
  61: ['Light rain', 'rain'],
  63: ['Rain', 'rain'],
  65: ['Heavy rain', 'rain'],
  66: ['Freezing rain', 'rain'],
  67: ['Freezing rain', 'rain'],
  71: ['Light snow', 'snow'],
  73: ['Snow', 'snow'],
  75: ['Heavy snow', 'snow'],
  77: ['Snow grains', 'snow'],
  80: ['Showers', 'drizzle'],
  81: ['Showers', 'rain'],
  82: ['Heavy showers', 'rain'],
  85: ['Snow showers', 'snow'],
  86: ['Snow showers', 'snow'],
  95: ['Thunderstorm', 'thunder'],
  96: ['Thunderstorm', 'thunder'],
  99: ['Thunderstorm', 'thunder'],
};

export function describe(code: number) {
  const [label, sky] = CODES[code] ?? ['Unknown', 'cloudy'];
  return { label, sky };
}
