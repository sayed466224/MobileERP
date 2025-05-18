import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mobileerp.app',
  appName: 'MobileERP',
  webDir: 'dist',
  android: {
    buildOptions: {
      releaseType: 'APK'
    }
  },
  server: {
    androidScheme: 'https',
    cleartext: true
  }
};

export default config;
