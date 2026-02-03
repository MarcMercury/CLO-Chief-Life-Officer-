# 🔌 Future Integrations Setup

## Overview
This folder contains templates and documentation for future CLO integrations.

---

## 📋 Planned Integrations

### Priority 1 (Near-term)
| Integration | Purpose | Status |
|-------------|---------|--------|
| OpenWeatherMap | Weather widget on dashboard | Template ready |
| Resend | Production email service | Template ready |

### Priority 2 (Medium-term)
| Integration | Purpose | Status |
|-------------|---------|--------|
| Oura Ring | Bio-metrics for Self circle | Template ready |
| Apple HealthKit | iOS health data | Requires native code |
| Google Fit | Android health data | Requires native code |

### Priority 3 (Future)
| Integration | Purpose | Status |
|-------------|---------|--------|
| Spotify | Music mood tracking | Planned |
| Todoist | Task import | Planned |
| Notion | Note import | Planned |
| Plaid | Financial health | Planned |

---

## 🌤️ OpenWeatherMap

### Setup
1. Get API key at https://openweathermap.org/api
2. Free tier: 1000 calls/day

### Configuration
```bash
# Add to Edge Function secrets
supabase secrets set OPENWEATHERMAP_API_KEY=your-key

# Or add to .env for client-side
OPENWEATHERMAP_API_KEY=your-key
```

### API Usage
```typescript
const response = await fetch(
  `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
);
```

---

## 💍 Oura Ring

### Setup
1. Register app at https://cloud.ouraring.com/oauth/applications
2. Request required scopes
3. Implement OAuth flow

### Configuration
```env
OURA_CLIENT_ID=your-client-id
OURA_CLIENT_SECRET=your-client-secret
OURA_REDIRECT_URI=clo://integrations/oura/callback
```

### Required Scopes
- `daily` - Daily summaries
- `heartrate` - Heart rate data
- `session` - Activity sessions
- `personal` - User info

### Data Available
- Sleep score and stages
- Readiness score
- Activity metrics
- Heart rate variability

---

## 📧 Resend (Email Service)

### Setup
1. Create account at https://resend.com
2. Verify sending domain
3. Generate API key

### Configuration
```bash
# For Edge Functions
supabase secrets set RESEND_API_KEY=re_your-key

# Or configure in Supabase Dashboard
# Settings → Auth → SMTP Settings
```

### Use Cases
- Relationship capsule invitations
- Weekly digest emails
- Reminder notifications

---

## 🎵 Spotify (Future)

### Planned Features
- Current mood based on listening
- Shared playlists in capsules
- Music memories timeline

### Setup Steps
1. Register at https://developer.spotify.com
2. Create application
3. Configure redirect URIs
4. Request user-library-read scope

---

## ✅ Todoist (Future)

### Planned Features
- Import tasks to Items
- Sync due dates
- Project mapping to Circles

---

## 📝 Notion (Future)

### Planned Features
- Import notes and databases
- Sync reading lists
- Backup data to Notion

---

## 💰 Plaid (Future)

### Planned Features
- Subscription detection
- Budget overview in Home
- Financial health score

### Security Notes
- Requires enhanced security review
- PCI compliance considerations
- Bank-grade encryption required

---

## 🔐 Security Guidelines for All Integrations

### Token Storage
- Store OAuth tokens in `integrations` table
- Encrypt sensitive tokens
- Implement automatic refresh

### Rate Limiting
- Respect API rate limits
- Implement exponential backoff
- Cache responses when appropriate

### Privacy
- Only request minimum required scopes
- Allow users to revoke access
- Clear data on disconnect

---

## 📁 Template Files

Each integration should have:
```
integrations/
├── {service}/
│   ├── README.md           # Setup instructions
│   ├── config.json.template # Configuration template
│   └── scopes.md           # Required permissions
```

---

## 📅 Last Updated
- **Date**: January 29, 2026
- **Version**: 1.0
