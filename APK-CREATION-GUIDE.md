# Mobile ERP Android APK Creation Guide

This guide will walk you through the process of creating an Android APK file for your Mobile ERP application.

## Prerequisites

- Android Studio installed on your local machine
- Java Development Kit (JDK) 11 or later installed
- Basic knowledge of Android app development

## Step-by-Step Guide

### 1. Initial Setup (Already Completed)

The following steps have already been completed in your Replit workspace:

- ✅ Capacitor has been installed
- ✅ The capacitor.config.ts file has been configured
- ✅ A basic Android project structure has been generated
- ✅ The Android platform has been added to your project

### 2. Download the Android Project

To build the APK, you'll need to download the Android project folder from Replit to your local machine:

1. In Replit, navigate to the project root
2. Locate the `android` folder in the file explorer
3. Right-click on the `android` folder and select "Download"
4. Save the downloaded zip file to your local machine
5. Extract the contents of the zip file to a location of your choice

### 3. Open the Project in Android Studio

1. Open Android Studio on your local machine
2. Select "Open an Existing Project"
3. Navigate to the extracted `android` folder and select it
4. Wait for Android Studio to sync the project with Gradle (this may take a few minutes)

### 4. Configure Build Settings (Optional)

You can customize build settings in Android Studio:

1. Open `android/app/build.gradle`
2. Update the `applicationId` if needed (currently set to "com.mobileerp.app")
3. Update `versionCode` and `versionName` according to your requirements
4. Save your changes

### 5. Build the Debug APK

For testing purposes, you can build a debug APK:

1. In Android Studio, select **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
2. Wait for the build process to complete
3. Click on the notification that appears, or navigate to `android/app/build/outputs/apk/debug/app-debug.apk`
4. Copy the APK file to your Android device to install it

### 6. Build a Release APK (For Production)

To create a signed release APK for distribution:

1. In Android Studio, select **Build** > **Generate Signed Bundle / APK**
2. Select **APK** and click **Next**
3. Create a new keystore or use an existing one:
   - If creating a new keystore, fill in the required information (store path, password, key alias, etc.)
   - If using an existing keystore, browse to select it and enter the required passwords
4. Click **Next**
5. Select the **release** build variant
6. Click **Finish** to generate the signed APK
7. The signed APK will be created in `android/app/release/app-release.apk`

### 7. Install the APK on Your Device

1. Enable "Install from Unknown Sources" in your Android device settings
2. Transfer the APK file to your Android device
3. Locate the APK file on your device and tap it to install

## Troubleshooting

If you encounter issues during the build process:

1. **Gradle Sync Issues**: Make sure you have the latest Android Studio and Android SDK tools installed
2. **Build Failures**: Check the Gradle console for specific error messages
3. **Memory Issues**: If the build fails due to memory limitations, increase the Gradle memory allocation in `android/gradle.properties`:
   ```
   org.gradle.jvmargs=-Xmx2048m
   ```
4. **Missing Android SDK**: Make sure you have the correct Android SDK versions installed via Android Studio's SDK Manager

## Next Steps

After successfully building and installing your APK:

1. Test the application thoroughly on different devices
2. Consider submitting your app to the Google Play Store
3. Set up automated builds using CI/CD for future updates

For any additional Android-specific configurations or features, refer to the Capacitor Android documentation: https://capacitorjs.com/docs/android