# Quick APK Build Guide for Mobile ERP

This guide will help you create an Android APK file from your Mobile ERP application.

## Building from Replit to APK (Step-by-Step)

### Step 1: Build the web application
First, build your web application by running:
```bash
npm run build
```
This will create a production-ready build in the `dist` directory.

### Step 2: Add Android platform to your project
Run the following command to add Android platform to your Capacitor project:
```bash
npx cap add android
```

### Step 3: Copy your web app build to Android
Run the following command to sync your web app to the Android platform:
```bash
npx cap sync android
```

### Step 4: Download the Android project
After completing steps 1-3, a new `android` directory will be created in your project.
You'll need to download this entire folder to your local machine where you have Android Studio installed.

Options for downloading:
- Use the Replit file system UI to download the `android` folder
- Create a zip file of the Android folder and download it:
  ```bash
  zip -r android-project.zip android
  ```
  Then download `android-project.zip`

### Step 5: Open in Android Studio
- Extract the downloaded Android project on your local machine
- Open Android Studio
- Select "Open an Existing Project" and navigate to the extracted Android folder
- Wait for Gradle sync to complete

### Step 6: Build the APK in Android Studio
- Go to Build > Build Bundle(s) / APK(s) > Build APK(s)
- Wait for the build to complete
- Android Studio will show a notification when done
- Click "locate" to find your APK file (typically in `android/app/build/outputs/apk/debug/`)

### Step 7: Install on your device
- Transfer the APK to your device
- On your Android device, enable installation from unknown sources
- Navigate to the APK file and tap to install

## Troubleshooting Tips

- If you encounter build errors, check the Gradle console in Android Studio
- Make sure you have the latest JDK and Android SDK tools installed
- If there are memory issues, increase Gradle memory in `android/gradle.properties`

## For Production Releases

For proper Google Play Store releases, you'll need to:
1. Create a signing key
2. Configure signing in `android/app/build.gradle`
3. Build a release APK with proper versioning
4. Follow Google Play submission guidelines