# Smart Desk Display

A landscape "smart display" for an old Android phone that lives on a desk all day: a clock, the weather, a voice-driven to-do list and a pomodoro timer. Built with Expo / React Native and tuned for a Redmi Note 8 (851×393 dp in landscape).

## Screens

Swipe left and right between three pages:

| | |
|---|---|
| **Home** | Clock, current weather, next 24 hours, five-day forecast |
| **To-do** | Multiple lists, add and edit by voice, swipe to delete or edit, drag to reorder |
| **Focus** | Pomodoro timer with adjustable lengths; the phone vibrates when a session ends |

## Two looks, day and night

- **Studio** — colour-block panel on the left, analog clock, soft illustrated weather.
- **Fieldnotes** — typographic grid, big digital clock, flat colour blocks.

Long-press a screen's label (`HOME / 01` in Studio, the `FIELDNOTES` wordmark in Fieldnotes) to switch; the choice is remembered. Both switch to a dark palette between sunset and sunrise for your location.

## Battery

The phone is meant to stay on, so the app tries to do as little as possible:

- Location comes from an IP lookup once a day — no GPS.
- Weather refreshes every 30 minutes and is cached, so it shows instantly on launch.
- Only the visible page ticks every second; everything pauses when the app is in the background.

## Getting started

Requirements: Node 20+, an [Expo](https://expo.dev) account, and `adb` from the Android platform tools.

```bash
npm ci
npx eas-cli@latest build -p android --profile development
```

Install the APK from the build page on the phone, then start the dev server and point the app at it over USB:

```bash
npx expo start
adb reverse tcp:8081 tcp:8081
adb shell am start -a android.intent.action.VIEW -d "exp+panel://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081"
```

For a standalone APK that runs without a computer, build the `preview` profile instead.

You can also preview the layout in a browser with `npx expo start --web` (voice input, vibration and page swiping only work on the phone).

## Configuration

Everything lives in [`src/config.ts`](src/config.ts):

| Setting | What it does |
|---|---|
| `FIXED_LOCATION` | Use a fixed city instead of IP-based location |
| `THEME` | `'auto'`, `'light'` or `'dark'` |
| `DEFAULT_DESIGN` | `'studio'` or `'fieldnotes'` on first launch |
| `SHOW_SECONDS` | Second hand / per-second redraws on the clock |
| `WEATHER_REFRESH_MS` | How often weather is fetched |

Weather data is from [Open-Meteo](https://open-meteo.com) (no API key needed) and location from [GeoJS](https://www.geojs.io).

## Notes for Xiaomi / MIUI phones

- **Installing from USB is blocked** without a SIM and Mi account ("Install via USB"). Copy the APK to the phone and install it from the file manager instead; after that, code changes load over the dev server without reinstalling.
- **Dark mode recolours apps.** MIUI forces its dark mode on third-party apps, which washes out the day theme. The app opts out (`plugins/withNoForceDark.js`); on older builds, turn dark mode off for the app in Settings → Display → Dark mode.
- **Voice input needs a speech service.** Android's speech recognition comes from the Google app — if you've removed it while debloating, restore it with `adb shell cmd package install-existing com.google.android.googlequicksearchbox`.

## Project layout

```
App.tsx                 pages and providers
src/screens/            Studio screens
src/fieldnotes/         Fieldnotes screens and their palette
src/components/         shared Studio pieces (colour panel, clock disc, text placement)
src/weather/            Open-Meteo client, weather codes, icons
src/todo/               lists, dictation, row component
src/pomodoro/           timer state
plugins/                Expo config plugins
```

## License

[MIT](LICENSE)
