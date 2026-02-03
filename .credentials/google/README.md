# 🔴 Google Cloud Credentials Setup

## Overview
Google Cloud provides OAuth authentication and API access for CLO.

---

## 🚀 Setup Steps

### 1. Create Google Cloud Project
1. Go to https://console.cloud.google.com
2. Create new project: `Chief Life Officer`
3. Note the Project ID and Number

### 2. Enable Required APIs
Navigate to APIs & Services → Library and enable:
- ✅ Google Sign-In (Identity Toolkit API)
- ✅ Google Calendar API (for future sync)
- ✅ Google People API (for contacts, future)

### 3. Configure OAuth Consent Screen
1. Go to APIs & Services → OAuth consent screen
2. User type: External
3. App name: `CLO - Chief Life Officer`
4. User support email: Your email
5. Scopes: `email`, `profile`, `openid`
6. Test users: Add your test emails

### 4. Create OAuth Credentials

#### Web Client (Required)
1. Go to APIs & Services → Credentials
2. Create Credentials → OAuth Client ID
3. Application type: Web application
4. Name: `CLO Web Client`
5. Authorized redirect URIs:
   ```
   https://YOUR_SUPABASE_REF.supabase.co/auth/v1/callback
   clo://auth/callback
   http://localhost:8081/auth/callback
   https://*.app.github.dev/auth/callback
   ```

#### iOS Client (Future)
1. Application type: iOS
2. Bundle ID: `com.clo.sanctuary`

#### Android Client (Future)
1. Application type: Android
2. Package name: `com.clo.sanctuary`
3. SHA-1 signing certificate fingerprint

---

## 📝 Configuration Template

### oauth-config.json.template
```json
{
  "project_id": "chief-life-officer",
  "project_number": "your_project_number",
  "web_client": {
    "client_id": "your_client_id.apps.googleusercontent.com",
    "redirect_uris": [
      "https://YOUR_REF.supabase.co/auth/v1/callback",
      "clo://auth/callback"
    ]
  },
  "ios_client": {
    "client_id": "",
    "bundle_id": "com.clo.sanctuary"
  },
  "android_client": {
    "client_id": "",
    "package_name": "com.clo.sanctuary"
  },
  "enabled_apis": [
    "identitytoolkit.googleapis.com",
    "calendar-json.googleapis.com",
    "people.googleapis.com"
  ]
}
```

---

## 🔐 Security Configuration

### OAuth Scopes Used
| Scope | Purpose | Sensitivity |
|-------|---------|-------------|
| `email` | Get user email | Basic |
| `profile` | Get user name/photo | Basic |
| `openid` | OpenID Connect | Basic |
| `calendar.readonly` | Read calendar (future) | Sensitive |
| `contacts.readonly` | Read contacts (future) | Sensitive |

### Consent Screen Settings
- Publishing status: Testing (for development)
- Verification: Required before production

---

## 🔌 Integration with Supabase

### 1. Configure Google Provider in Supabase
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google
3. Enter:
   - Client ID: From Google Cloud
   - Client Secret: From Google Cloud (keep secret!)
4. Save

### 2. Authorized Domains
Add to Google Cloud Console:
- `supabase.co`
- `localhost` (for development)
- Your custom domain (if any)

---

## 📱 Platform-Specific Setup

### Expo/React Native
```typescript
// In clo/lib/supabase.ts
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'clo://auth/callback',
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
});
```

### iOS Requirements
- Add URL scheme `clo` to Info.plist
- Configure associated domains (if using universal links)

### Android Requirements
- Generate SHA-1: `./gradlew signingReport`
- Add to Google Cloud Console
- Configure deep links in AndroidManifest.xml

---

## 🔄 Token Refresh

Google tokens expire after 1 hour. Supabase handles refresh automatically when:
1. User granted `offline` access
2. Refresh token is valid
3. User hasn't revoked access

---

## ⚠️ Important Notes

1. **Keep Client Secret secure** - Never expose in client code
2. **Test on real devices** - OAuth behaves differently on simulators
3. **Verify consent screen** before production launch
4. **Monitor API quotas** - Free tier has limits

---

## 🆘 Troubleshooting

### "redirect_uri_mismatch"
- Check exact redirect URI matches in Google Console
- Include scheme, domain, port, and path exactly

### "access_denied"
- User may have denied consent
- Check if user is a test user (if in testing mode)

### "invalid_client"
- Verify Client ID is correct
- Check if credentials are for correct project

---

## 📅 Last Updated
- **Date**: January 29, 2026
- **Version**: 1.0
