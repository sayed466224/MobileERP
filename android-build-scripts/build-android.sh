#!/bin/bash

# Build script for creating an Android APK using Capacitor

echo "Building application..."
npm run build

echo "Adding Android platform to Capacitor..."
npx cap add android

echo "Syncing web app with Android platform..."
npx cap sync android

echo "Build complete. The Android project is ready for opening in Android Studio."
echo "To build the APK, open the Android folder in Android Studio and use Build > Build Bundle(s) / APK(s) > Build APK(s)"