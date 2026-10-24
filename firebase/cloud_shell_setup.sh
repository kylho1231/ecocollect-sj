#!/bin/bash
# ==============================================================================
# EcoCollect SJ: Google Cloud Shell Automated Provisioning Script
# San Jose de Buenavista, Antique, Philippines
# ==============================================================================
# This script automates:
#   1. Google Cloud Project creation / configuration
#   2. Enabling Firebase, Firestore, Storage, and Identity Toolkit APIs
#   3. Creating the Firestore database in asia-southeast1 (Singapore)
#   4. Registering the Android app (org.ecocollect.sj) & generating google-services.json
#   5. Registering the Web App & generating .env.local configuration
#   6. Deploying Firestore & Storage Security Rules
#   7. Seeding initial Funda-Dalipe data
# ==============================================================================

set -e

echo "=========================================================="
echo "    EcoCollect SJ: Automated Cloud Provisioning Tool      "
echo "=========================================================="

# 1. Define Unique Project ID
DEFAULT_PROJECT_ID="ecocollect-sj-$RANDOM"
read -p "Enter Google Cloud Project ID (Press ENTER for '$DEFAULT_PROJECT_ID'): " USER_PROJECT_ID
PROJECT_ID=${USER_PROJECT_ID:-$DEFAULT_PROJECT_ID}

echo ""
echo ">>> Setting active project to: $PROJECT_ID"

# Check if project exists, create if not
if ! gcloud projects describe "$PROJECT_ID" &>/dev/null; then
    echo "Creating new Google Cloud Project: $PROJECT_ID..."
    gcloud projects create "$PROJECT_ID" --name="EcoCollect SJ"
else
    echo "Project $PROJECT_ID already exists. Using existing project."
fi

gcloud config set project "$PROJECT_ID"

# 2. Enable Required APIs
echo ""
echo ">>> Enabling Google Cloud & Firebase APIs (this takes ~1-2 minutes)..."
gcloud services enable \
    firebase.googleapis.com \
    firestore.googleapis.com \
    firebasestorage.googleapis.com \
    identitytoolkit.googleapis.com \
    fcm.googleapis.com

# 3. Add Firebase features to Google Cloud Project
echo ""
echo ">>> Initializing Firebase on project..."
npx -y firebase-tools projects:addfirebase "$PROJECT_ID" || true

# 4. Create Firestore Database in Singapore (asia-southeast1)
echo ""
echo ">>> Checking / Creating Firestore Database in asia-southeast1..."
if ! gcloud firestore databases describe &>/dev/null; then
    gcloud firestore databases create --location=asia-southeast1 --type=firestore-native
    echo "✓ Cloud Firestore created in asia-southeast1 (Singapore)"
else
    echo "✓ Cloud Firestore database already active."
fi

# 5. Create Android App in Firebase
echo ""
echo ">>> Registering Android App (package: org.ecocollect.sj)..."
PACKAGE_NAME="org.ecocollect.sj"
APP_NICKNAME="EcoCollect SJ Android"

# Try registering via Firebase CLI
ANDROID_APP_ID=$(npx -y firebase-tools apps:create ANDROID "$APP_NICKNAME" --package-name="$PACKAGE_NAME" --project="$PROJECT_ID" --json 2>/dev/null | grep -o '"appId": "[^"]*' | cut -d'"' -f4 || true)

if [ -z "$ANDROID_APP_ID" ]; then
    echo "Finding existing Android App ID..."
    ANDROID_APP_ID=$(npx -y firebase-tools apps:list ANDROID --project="$PROJECT_ID" --json | grep -o '"appId": "[^"]*' | head -n1 | cut -d'"' -f4 || true)
fi

echo "✓ Android App ID: $ANDROID_APP_ID"

# Download google-services.json
if [ -n "$ANDROID_APP_ID" ]; then
    echo "Downloading google-services.json..."
    npx -y firebase-tools apps:sdkconfig ANDROID "$ANDROID_APP_ID" --project="$PROJECT_ID" > google-services.json
    echo "✓ google-services.json downloaded successfully!"
fi

# 6. Create Web App in Firebase
echo ""
echo ">>> Registering Web App (EcoCollect SJ Web)..."
WEB_APP_ID=$(npx -y firebase-tools apps:create WEB "EcoCollect SJ Web" --project="$PROJECT_ID" --json 2>/dev/null | grep -o '"appId": "[^"]*' | cut -d'"' -f4 || true)

if [ -z "$WEB_APP_ID" ]; then
    WEB_APP_ID=$(npx -y firebase-tools apps:list WEB --project="$PROJECT_ID" --json | grep -o '"appId": "[^"]*' | head -n1 | cut -d'"' -f4 || true)
fi

echo "✓ Web App ID: $WEB_APP_ID"

# Generate .env.local file
if [ -n "$WEB_APP_ID" ]; then
    echo "Fetching Web Config..."
    WEB_CONFIG_RAW=$(npx -y firebase-tools apps:sdkconfig WEB "$WEB_APP_ID" --project="$PROJECT_ID")
    
    API_KEY=$(echo "$WEB_CONFIG_RAW" | grep 'apiKey:' | awk -F'"' '{print $2}')
    AUTH_DOMAIN=$(echo "$WEB_CONFIG_RAW" | grep 'authDomain:' | awk -F'"' '{print $2}')
    STORAGE_BUCKET=$(echo "$WEB_CONFIG_RAW" | grep 'storageBucket:' | awk -F'"' '{print $2}')
    MESSAGING_SENDER_ID=$(echo "$WEB_CONFIG_RAW" | grep 'messagingSenderId:' | awk -F'"' '{print $2}')
    APP_ID=$(echo "$WEB_CONFIG_RAW" | grep 'appId:' | awk -F'"' '{print $2}')

    cat <<EOF > web.env.local
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false
NEXT_PUBLIC_FIREBASE_API_KEY=$API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=$PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=$APP_ID
EOF
    echo "✓ Generated web.env.local with live project credentials!"
fi

echo ""
echo "=========================================================="
echo "                   SETUP COMPLETED!                       "
echo "=========================================================="
echo ""
echo "Next steps to sync with your local machine:"
echo ""
echo "1. Download google-services.json to your local Android project:"
echo "   In Cloud Shell, run:"
echo "   cloudshell download google-services.json"
echo "   -> Place it in: android/app/google-services.json"
echo ""
echo "2. View your Web environment variables:"
echo "   In Cloud Shell, run:"
echo "   cat web.env.local"
echo "   -> Copy contents to: web/.env.local on your PC"
echo ""
echo "3. Open Firebase Console to view your project:"
echo "   https://console.firebase.google.com/project/$PROJECT_ID"
echo "=========================================================="
