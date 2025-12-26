# CLO - Expo & App Store Setup Guide

## ✅ Current Configuration

Your project is now configured with:
- **Expo Account**: marcmercury
- **Project ID**: 134e7861-725f-4076-b1dd-3b374c7cf69f
- **Bundle ID** (iOS): `com.clo.sanctuary`
- **Package Name** (Android): `com.clo.sanctuary`
- **EAS Build**: Configured with development, preview, and production profiles
- **EAS Updates**: Configured for OTA updates

---

## 🔧 Steps to Complete Setup

### 1. Create a Development Build (for QR Code Scanning)

Run this command to create a development build you can install on your device:

```bash
# For Android (APK you can install directly)
eas build --platform android --profile development

# For iOS (requires Apple Developer account)
eas build --platform ios --profile development
```

**Note**: First build will prompt you to:
- Android: Generate a new keystore (select "Generate new keystore")
- iOS: Sign in with your Apple ID and select your team

### 2. Install the Development Build

Once the build completes (~10-15 minutes), you'll get:
- A download link for the APK (Android)
- A QR code to scan with your device (if you have Expo Go installed)

Install the development build on your device.

### 3. Run the App with QR Code

After installing the development build:

```bash
npx expo start --dev-client
```

Now the QR code will work! Scan it with your phone's camera to open the app.

---

## 📱 App Store Submission

### For Apple App Store

1. **Apple Developer Account** ($99/year): https://developer.apple.com/programs/

2. **Create App Store Connect App**:
   - Go to https://appstoreconnect.apple.com
   - Create a new app with Bundle ID: `com.clo.sanctuary`

3. **Build & Submit**:
   ```bash
   eas build --platform ios --profile production
   eas submit --platform ios
   ```

4. **Required Info for Submission**:
   - App name, description, keywords
   - Screenshots (6.5" and 5.5" iPhone, 12.9" iPad)
   - App icon (1024x1024)
   - Privacy policy URL
   - Age rating questionnaire

### For Google Play Store

1. **Google Play Developer Account** ($25 one-time): https://play.google.com/console

2. **Create Service Account** (for automated uploads):
   - Go to Google Cloud Console
   - Create a service account with Play Console access
   - Download the JSON key file

3. **Update eas.json** with your service account:
   ```json
   "submit": {
     "production": {
       "android": {
         "serviceAccountKeyPath": "./google-play-key.json",
         "track": "internal"
       }
     }
   }
   ```

4. **Build & Submit**:
   ```bash
   eas build --platform android --profile production
   eas submit --platform android
   ```

---

## 🔄 Over-the-Air Updates

Push updates without rebuilding:

```bash
# Push an update to development channel
eas update --channel development

# Push an update to production
eas update --channel production --message "Bug fixes"
```

---

## 📋 Required Assets Checklist

Before submission, ensure you have:

- [ ] **App Icon** (1024x1024 PNG, no alpha)
- [ ] **Splash Screen** (2048x2048 recommended)
- [ ] **iPhone Screenshots** (6.5" and 5.5")
- [ ] **iPad Screenshots** (12.9" - if iPad supported)
- [ ] **Android Screenshots** (phone and tablet)
- [ ] **Privacy Policy URL**
- [ ] **App Description** (short and long)
- [ ] **Keywords** (for App Store)

---

## 🚀 Quick Commands Reference

```bash
# Check login status
npx expo whoami

# View project info
eas project:info

# Start development server
npx expo start

# Start with dev client (after building)
npx expo start --dev-client

# Build for testing (internal distribution)
eas build --platform all --profile preview

# Build for stores
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android

# Push OTA update
eas update --channel production
```

---

## ❓ Troubleshooting

### QR Code Not Working?
1. Make sure you've created a development build first
2. Install the development build on your device
3. Use `npx expo start --dev-client` instead of `npx expo start`

### Build Failing?
1. Check EAS dashboard: https://expo.dev/accounts/marcmercury/projects/clo
2. Look at build logs for specific errors
3. Make sure all dependencies are installed

### Submission Rejected?
Common reasons:
- Missing privacy policy
- Incomplete metadata
- Screenshots don't match functionality
- App crashes on reviewer's device

---

## 📞 Support

- Expo Documentation: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
- EAS Submit: https://docs.expo.dev/submit/introduction/
