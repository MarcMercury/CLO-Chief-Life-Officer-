# 📱 Expo/EAS Credentials Setup

## Overview
Expo Application Services (EAS) handles builds, updates, and credential management for CLO.

---

## 🚀 Setup Steps

### 1. Create Expo Account
1. Go to https://expo.dev
2. Create account or sign in
3. Note your username

### 2. Link Project
```bash
cd clo
npx expo login
npx expo init --project-id your-project-id
```

### 3. Configure EAS
```bash
# Install EAS CLI
npm install -g eas-cli

# Initialize EAS
eas init

# Configure builds
eas build:configure
```

---

## 📝 Project Configuration

### app.json (Key Fields)
```json
{
  "expo": {
    "name": "CLO",
    "slug": "clo",
    "scheme": "clo",
    "owner": "your-username",
    "ios": {
      "bundleIdentifier": "com.clo.sanctuary"
    },
    "android": {
      "package": "com.clo.sanctuary"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### eas.json
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

---

## 🔐 Environment Secrets

### Setting EAS Environment Variables
```bash
# Set for all environments
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://..." --environment production

# Or set for specific environment
eas env:create \
  --name EXPO_PUBLIC_SUPABASE_ANON_KEY \
  --value "eyJ..." \
  --environment production \
  --sensitive

# List all secrets
eas env:list --environment production
```

### Required Secrets for Production
| Variable | Sensitive | Description |
|----------|-----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | No | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | No | Google OAuth client |

---

## 🔌 Build Credentials

### iOS Credentials
EAS can manage these automatically:
- Distribution Certificate
- Provisioning Profile
- Push Notification Key

```bash
# Let EAS manage credentials (recommended)
eas build --platform ios

# Or manage manually
eas credentials
```

### Android Credentials
- Keystore file
- Key alias and passwords

```bash
# Generate keystore with EAS
eas build --platform android

# Or upload existing keystore
eas credentials --platform android
```

---

## 📲 Over-the-Air Updates

### Configure Updates
```bash
# Create update branch
eas update --branch production --message "Bug fixes"

# Check update status
eas update:list
```

### Update Channels
- `development` - For dev client testing
- `preview` - For internal testing
- `production` - For App Store releases

---

## 🏗️ Build Commands

### Development Build
```bash
# iOS Simulator
eas build --profile development --platform ios

# Android Emulator
eas build --profile development --platform android
```

### Production Build
```bash
# iOS for App Store
eas build --profile production --platform ios

# Android for Play Store
eas build --profile production --platform android
```

### Submit to Stores
```bash
# Submit to App Store
eas submit --platform ios

# Submit to Play Store
eas submit --platform android
```

---

## 📊 Project Dashboard

Access your project at:
```
https://expo.dev/accounts/YOUR_USERNAME/projects/clo
```

### Available Information
- Build history and logs
- Update deployments
- Environment variables
- Crash reports
- Usage analytics

---

## ⚠️ Important Notes

### Version Management
- Use `autoIncrement` in eas.json for production
- Increment `expo.version` for new releases
- Keep `expo.runtimeVersion` consistent for OTA updates

### Deep Linking
- URL scheme: `clo://`
- Configure in app.json and platform-specific files
- Test with: `npx uri-scheme open clo://auth/callback`

### Push Notifications
- Configure APNs key in EAS credentials
- Set up FCM for Android
- Use `expo-notifications` library

---

## 🆘 Troubleshooting

### "Build failed"
- Check build logs in Expo dashboard
- Verify all required secrets are set
- Ensure native dependencies are compatible

### "Update not applying"
- Check runtime version matches
- Verify update channel is correct
- Force restart app after update

### "Credentials error"
- Run `eas credentials` to diagnose
- Revoke and regenerate if corrupted
- Check Apple/Google developer account status

---

## 📅 Last Updated
- **Date**: January 29, 2026
- **Version**: 1.0
