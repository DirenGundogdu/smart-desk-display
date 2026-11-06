// MIUI (and Android's force-dark) recolours apps when the system is in dark mode,
// turning our dark text light on the cream day theme. The app does its own day/night,
// so opt out on the app theme.
const { AndroidConfig, withAndroidStyles } = require('@expo/config-plugins');

module.exports = function withNoForceDark(config) {
  return withAndroidStyles(config, (cfg) => {
    cfg.modResults = AndroidConfig.Styles.assignStylesValue(cfg.modResults, {
      add: true,
      parent: AndroidConfig.Styles.getAppThemeGroup(),
      name: 'android:forceDarkAllowed',
      value: 'false',
    });
    return cfg;
  });
};
