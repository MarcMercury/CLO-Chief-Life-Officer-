# Phase 1 Verification Checklist

Use this checklist to verify that Phase 1 has been successfully implemented before moving to Phase 2.

---

## ✅ File Structure

Verify these files exist:

### Root Level
- [ ] `/workspaces/CLO-Chief-Life-Officer-/agent.md`
- [ ] `/workspaces/CLO-Chief-Life-Officer-/README.md`

### App Directory (`/workspaces/CLO-Chief-Life-Officer-/clo/`)
- [ ] `.env` (with Supabase credentials)
- [ ] `package.json` (main set to "expo-router/entry")
- [ ] `tsconfig.json` (with path aliases)
- [ ] `tailwind.config.js`
- [ ] `app.json` (with biometric permissions)

### App Structure
- [ ] `app/_layout.tsx` (with AuthProvider and QueryClientProvider)
- [ ] `app/index.tsx` (auth gate)
- [ ] `app/(main)/_layout.tsx`
- [ ] `app/(main)/index.tsx`

### Components
- [ ] `components/auth/LoginScreen.tsx`
- [ ] `components/auth/LockScreen.tsx`

### Core Files
- [ ] `lib/supabase.ts`
- [ ] `providers/AuthProvider.tsx`
- [ ] `store/uiStore.ts`
- [ ] `types/database.ts`

### Database
- [ ] `supabase/schema.sql`

### Documentation
- [ ] `README.md`
- [ ] `QUICK_START.md`
- [ ] `DEVELOPMENT_PHASES.md`

---

## 🗄️ Database Verification

### In Supabase Dashboard (https://tfjshcmchznxqsylvilp.supabase.co)

#### Tables Created
- [ ] `public.profiles` exists
- [ ] `public.items` exists
- [ ] `public.item_circles` exists
- [ ] `public.relationships` exists
- [ ] `public.integrations` exists

#### Check RLS Policies
Run this query in SQL Editor:
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

You should see policies for:
- [ ] profiles (select, update, insert)
- [ ] items (select, insert, update, delete)
- [ ] item_circles (select, insert, delete)
- [ ] relationships (select, insert, update, delete)
- [ ] integrations (select, insert, update, delete)

#### Verify Triggers
Run this query:
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

You should see:
- [ ] `on_auth_user_created` on auth.users
- [ ] `update_*_updated_at` triggers on all main tables

#### Verify View
```sql
SELECT table_name FROM information_schema.views WHERE table_schema = 'public';
```

You should see:
- [ ] `items_with_circles`

---

## 📦 Dependencies Installed

### Check package.json dependencies:
```bash
cd /workspaces/CLO-Chief-Life-Officer-/clo
npm list --depth=0
```

Required packages should be installed:
- [ ] `@supabase/supabase-js`
- [ ] `@tanstack/react-query`
- [ ] `zustand`
- [ ] `react-native-reanimated`
- [ ] `react-native-gesture-handler`
- [ ] `expo-haptics`
- [ ] `expo-local-authentication`
- [ ] `expo-blur`
- [ ] `expo-router`
- [ ] `nativewind`
- [ ] `tailwindcss`
- [ ] `react-native-url-polyfill`

---

## 🚀 App Functionality

### Start the App
```bash
cd /workspaces/CLO-Chief-Life-Officer-/clo
npm start
```

### Test Sign Up Flow
- [ ] App loads without errors
- [ ] You see "Enter Your Sanctuary" screen
- [ ] Click "Don't have an account? Sign Up"
- [ ] Can enter full name, email, password
- [ ] "Create Account" button works
- [ ] Haptic feedback on button press (on device)
- [ ] Success: Redirected to main screen

### Test Sign In Flow
- [ ] Can switch to Sign In mode
- [ ] Can enter email and password
- [ ] "Sign In" button works
- [ ] Success: Redirected to main screen
- [ ] Can see user email displayed

### Test Main Screen
- [ ] See "Welcome to CLO"
- [ ] See "Your Sanctuary Awaits"
- [ ] See user email
- [ ] See "Next Steps" info
- [ ] "Sign Out" button works
- [ ] After sign out, back to login screen

### Test Session Persistence
- [ ] Sign in to the app
- [ ] Reload the app (Ctrl+R or Cmd+R)
- [ ] Should still be signed in (not shown login screen)

### Test Biometric Lock
**Note: This only works on physical devices with Face ID/Touch ID**

- [ ] Sign in to the app
- [ ] Minimize/background the app
- [ ] Wait 2 minutes
- [ ] Re-open the app
- [ ] Should see "Sanctuary Locked" screen
- [ ] Biometric authentication should trigger automatically
- [ ] After successful auth, should see main screen

### Check Supabase Auth Dashboard
1. Go to: https://tfjshcmchznxqsylvilp.supabase.co/project/_/auth/users
2. Verify:
   - [ ] User appears in the list
   - [ ] Email is correct
   - [ ] Last sign in time is recent

### Check Profiles Table
1. Go to: https://tfjshcmchznxqsylvilp.supabase.co/project/_/editor
2. Click "profiles" table
3. Verify:
   - [ ] Profile auto-created for your user
   - [ ] `id` matches the user ID in Auth
   - [ ] `full_name` is populated

---

## 🐛 Common Issues Checklist

### If app won't start:
- [ ] Ran `npm install` in clo directory
- [ ] `.env` file exists with correct credentials
- [ ] No TypeScript errors in terminal
- [ ] Try deleting `node_modules` and running `npm install` again

### If "Missing Supabase environment variables" error:
- [ ] `.env` file is in `/workspaces/CLO-Chief-Life-Officer-/clo/` (not root)
- [ ] File has all three required variables
- [ ] Restarted the dev server after creating `.env`

### If database errors occur:
- [ ] Ran the entire `schema.sql` in Supabase SQL Editor
- [ ] No errors appeared in SQL Editor
- [ ] RLS is enabled on all tables
- [ ] Policies are created correctly

### If login doesn't work:
- [ ] Check browser console / terminal for errors
- [ ] Verify Supabase URL and Anon Key are correct
- [ ] Check email in Supabase Auth dashboard
- [ ] Try different email/password

### If Google OAuth doesn't work:
- [ ] Google provider enabled in Supabase Auth settings
- [ ] Client ID and Secret added to Supabase
- [ ] Redirect URIs configured in Google Cloud Console
- [ ] Note: May not work in Expo Go - test in web browser first

---

## 📊 Final Verification

### Code Quality
- [ ] No TypeScript `any` types (strict mode enforced)
- [ ] No console errors when running
- [ ] All imports use `@/` alias (not relative paths)
- [ ] Files follow naming conventions (PascalCase for components)

### Security
- [ ] `.env` is in `.gitignore`
- [ ] RLS policies tested (can't see other users' data)
- [ ] Biometric lock works (on device)
- [ ] Session management works correctly

### Documentation
- [ ] README.md is clear and complete
- [ ] QUICK_START.md has all run instructions
- [ ] DEVELOPMENT_PHASES.md has Phase 2 prompt ready
- [ ] agent.md has coding standards

---

## 🎯 Phase 1 Complete Criteria

**You can move to Phase 2 when:**

1. ✅ All files in "File Structure" section exist
2. ✅ All database tables and policies are created
3. ✅ All dependencies are installed
4. ✅ Sign up/sign in works without errors
5. ✅ Session persistence works (stays logged in on reload)
6. ✅ User and profile appear in Supabase dashboard
7. ✅ Sign out works correctly
8. ✅ No TypeScript or runtime errors

---

## 🚀 Ready for Phase 2?

If all items above are checked:

1. 🎉 Congratulations! Phase 1 is complete
2. 📖 Open `DEVELOPMENT_PHASES.md`
3. 📋 Copy the Phase 2 prompt
4. 🤖 Paste to your coding agent
5. 🚀 Start building the Orbital Navigation!

---

## 📞 Need Help?

If something doesn't work:
1. Check this checklist item by item
2. Review error messages in terminal/console
3. Check Supabase dashboard for database issues
4. Read `QUICK_START.md` troubleshooting section
5. Ensure you're testing on the right platform (some features require physical device)

---

**Date Completed**: _________________

**Tested By**: _________________

**Notes**: 
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
