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


// Width (dp) of the camera notch on the left edge in landscape; MIUI paints it black.
// 29 dp fits a Redmi Note 8 (80 px at 2.75x); set 0 on phones without a side cutout.
export const NOTCH_INSET_LEFT = 29;
