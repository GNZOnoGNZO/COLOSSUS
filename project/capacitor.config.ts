import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.colossus.universe',
  appName: 'Colossus Universe',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#2F1810',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
    },
  },
};

export default config;