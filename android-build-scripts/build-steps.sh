#!/bin/bash

# Step 1: Create a dist directory if it doesn't exist
mkdir -p dist

# Step 2: Create a minimal index.html in the dist directory 
# This is just for initial Capacitor setup
cat > dist/index.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mobile ERP</title>
</head>
<body>
  <h1>Mobile ERP Application</h1>
  <p>This is a placeholder for the Mobile ERP application.</p>
</body>
</html>
EOF

# Step 3: Add Android platform to Capacitor
npx cap add android

echo "Android platform has been added to the project."
echo "Next steps:"
echo "1. Run 'npm run build' to build your application"
echo "2. Run 'npx cap sync android' to sync your built application with Android"
echo "3. Download the 'android' folder to your local machine"
echo "4. Open the downloaded 'android' folder in Android Studio"
echo "5. Build the APK using Android Studio"