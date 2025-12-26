# CLO - Quick Start Guide

## 🎯 What's Been Built (Phase 1)

✅ **Complete authentication system** with:
- Email/password sign up and sign in
- Google OAuth integration
- Biometric lock screen (Face ID/Touch ID)
- Auto-lock after 2 minutes in background
- Secure session management

✅ **Database infrastructure**:
- Full PostgreSQL schema on Supabase
- Row Level Security policies
- User profiles, items, relationships, integrations tables
- TypeScript types generated

✅ **Project foundation**:
- Expo + React Native + TypeScript
- Expo Router for navigation
- Zustand for state management
- TanStack Query for data fetching
- React Native Reanimated for animations
- Gesture Handler for touch interactions

---

## 🚀 Running the App

### 1. Navigate to Project
```bash
cd /workspaces/CLO-Chief-Life-Officer-/clo
```

### 2. Install Dependencies (if needed)
```bash
npm install
```

### 3. Start Development Server
```bash
npm start
```

This will open Expo Dev Tools. You can then:
- Press `w` - Open in web browser
- Press `a` - Open on Android emulator
- Press `i` - Open on iOS simulator (Mac only)
- Scan QR code with Expo Go app on your phone

---

## 🗄️ Database Setup

**IMPORTANT**: You must run the database migration before the app will work!

1. Go to your Supabase dashboard: https://tfjshcmchznxqsylvilp.supabase.co
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `/workspaces/CLO-Chief-Life-Officer-/clo/supabase/schema.sql`
5. Paste into the SQL editor
6. Click "Run" or press `Ctrl+Enter`

You should see: "Success. No rows returned"

### Verify Database Setup

Run this query to verify tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- profiles
- items
- item_circles
- relationships
- integrations

---

## 🔐 Setting Up Google OAuth (Optional)

Google sign-in is configured but requires additional setup for production:

### For Web Testing (Already Configured):
1. Client ID is already in `.env`
2. Authorized redirect URIs configured for `localhost`

### For Mobile Apps (Future):
1. Go to Google Cloud Console: https://console.cloud.google.com/apis/credentials?project=chief-life-officer
2. Create OAuth 2.0 Client IDs for iOS and Android
3. Add the client IDs to `.env`:
   - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
   - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

### Configure Supabase Auth:
1. Go to: https://tfjshcmchznxqsylvilp.supabase.co/project/_/auth/providers
2. Enable Google provider
3. Add your Google Client ID and Secret from Google Cloud Console

---

## ✅ Testing the Authentication Flow

### Test Email Sign Up:
1. Start the app: `npm start`
2. Open on web or device
3. Click "Don't have an account? Sign Up"
4. Enter:
   - Full Name: "Test User"
   - Email: "test@example.com"
   - Password: "TestPassword123!"
5. Click "Create Account"
6. Check your email for confirmation (if email confirmations are enabled in Supabase)

### Test Email Sign In:
1. Use the email and password from sign up
2. Click "Sign In"
3. You should see the main screen with "Welcome to CLO"

### Test Biometric Lock:
1. Sign in to the app
2. Put the app in background (minimize/switch apps)
3. Wait 2 minutes
4. Re-open the app
5. You should see "Sanctuary Locked" screen
6. Biometric authentication should trigger automatically

**Note**: Biometrics only work on physical devices, not in web browser or some simulators.

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Check that `.env` file exists in `/workspaces/CLO-Chief-Life-Officer-/clo/`
- Restart the Expo dev server: `Ctrl+C` then `npm start`

### "relation 'public.profiles' does not exist"
- You haven't run the database migration
- Follow the "Database Setup" section above

### Google OAuth doesn't work
- Enable Google provider in Supabase Auth settings
- Make sure redirect URIs are configured in Google Cloud Console
- For web testing, use `http://localhost:19006` or `http://localhost:8081`

### App crashes on biometric authentication
- Biometrics only work on physical devices
- On simulator/web, the app will unlock automatically
- Make sure you have Face ID or Touch ID enrolled on your device

### TypeScript errors
- Run: `npm install` to ensure all dependencies are installed
- Check that `tsconfig.json` has `"strict": true` and path aliases configured

---

## 📱 Recommended Testing Setup

### For Development:
1. **Web browser** (fastest for UI development)
   - Run: `npm start` then press `w`
   - Good for testing layout and basic functionality
   - Biometrics and haptics won't work

2. **iOS Simulator** (Mac only)
   - Run: `npm start` then press `i`
   - Good for testing animations and gestures
   - Biometrics won't work unless configured

3. **Physical Device** (best for final testing)
   - Install Expo Go app
   - Scan QR code from `npm start`
   - Full biometric and haptic support

---

## 📊 Check Authentication in Supabase

1. Go to: https://tfjshcmchznxqsylvilp.supabase.co/project/_/auth/users
2. You should see users you created
3. Click on a user to see their details
4. Go to: https://tfjshcmchznxqsylvilp.supabase.co/project/_/editor
5. Click "profiles" table
6. You should see a profile auto-created for each user

---

## 🎨 Current App Features

### ✅ Working Now:
- Sign up with email/password
- Sign in with email/password
- Google OAuth (with proper configuration)
- Automatic profile creation
- Session persistence (stays logged in)
- Biometric lock after 2 minutes
- Sign out functionality
- Haptic feedback on buttons

### 🚧 Coming in Phase 2:
- Orbital gesture navigation
- Circle-based theming
- Self/Relationships/Home views
- Dashboard view

### 🚧 Coming in Phase 3:
- Create tasks, notes, events
- Assign items to circles
- View items by circle
- Complete/delete items

---

## 🎯 Next Steps

1. **Test the current authentication** thoroughly
2. **Verify database is working** by checking Supabase dashboard
3. **Copy Phase 2 prompt** from `DEVELOPMENT_PHASES.md`
4. **Paste to your coding agent** to build the Orbital Navigation

---

## 📞 Important Files

- **Environment**: `/workspaces/CLO-Chief-Life-Officer-/clo/.env`
- **Database Schema**: `/workspaces/CLO-Chief-Life-Officer-/clo/supabase/schema.sql`
- **Main App Entry**: `/workspaces/CLO-Chief-Life-Officer-/clo/app/index.tsx`
- **Auth Provider**: `/workspaces/CLO-Chief-Life-Officer-/clo/providers/AuthProvider.tsx`
- **Development Phases**: `/workspaces/CLO-Chief-Life-Officer-/clo/DEVELOPMENT_PHASES.md`

---

## 🔒 Security Reminders

- Never commit `.env` to git (already in `.gitignore`)
- Database password: `KuOMJv1JsppmnF3p` (for manual SQL access only)
- RLS policies ensure users can only see their own data
- Tokens are managed by Supabase Auth (secure)
- Biometric data never leaves the device

---

## 🌟 Philosophy

Remember: CLO is a **sanctuary**, not a social network. Every design decision should prioritize:
- Privacy (data is sacred)
- Calm (slow, organic animations)
- Intentionality (no infinite scrolls or notifications)
- Respect (haptics and timing feel deliberate)

Enjoy building your Life OS! 🌱
