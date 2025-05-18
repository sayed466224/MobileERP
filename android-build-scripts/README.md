# Android APK Build Guide for Mobile ERP

This guide explains how to build an Android APK for the Mobile ERP application.

## Prerequisites

- Android Studio installed on your local machine
- JDK 11+ installed
- Android SDK installed (usually comes with Android Studio)
- Gradle

## Build Process

1. Build the web application:
   ```bash
   npm run build
   ```

2. Add the Android platform to Capacitor:
   ```bash
   npx cap add android
   ```

3. Sync the web application with the Android platform:
   ```bash
   npx cap sync android
   ```

4. Open the Android project in Android Studio:
   ```bash
   npx cap open android
   ```

5. In Android Studio:
   - Wait for Gradle sync to complete
   - Go to Build > Build Bundle(s) / APK(s) > Build APK(s)
   - Android Studio will notify you when the APK is built
   - Click on "locate" in the notification to find your APK file

## Alternative: Command-line build

You can also build the APK from the command line:

1. Complete steps 1-3 above
2. Navigate to the Android directory:
   ```bash
   cd android
   ```
3. Build using Gradle:
   ```bash
   ./gradlew assembleDebug
   ```
   This will create a debug APK in `android/app/build/outputs/apk/debug/app-debug.apk`

4. For a release build:
   ```bash
   ./gradlew assembleRelease
   ```
   This requires signing configuration in `build.gradle`.

## Customization

- App icon: Replace icon files in `android/app/src/main/res/mipmap-*`
- Splash screen: Configure in `android/app/src/main/res/drawable`
- App name: Edit `android/app/src/main/res/values/strings.xml`

## Troubleshooting

- If build fails with memory errors, increase Gradle memory in `android/gradle.properties`:
  ```
  org.gradle.jvmargs=-Xmx2048m
  ```
  
- For signing issues, ensure your keystore is properly configured in `android/app/build.gradle`

## Distribution

Once built, you can:
- Install directly on devices using ADB
- Upload to Google Play Store
- Distribute through enterprise deployment methods