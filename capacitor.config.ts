import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mobileerp.app',
  appName: 'MobileERP',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#4f46e5",
      androidSplashResourceName: "splash",
      splashFullScreen: true,
      splashImmersive: true
    }
  },
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
