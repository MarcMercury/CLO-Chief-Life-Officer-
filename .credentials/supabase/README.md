# 🔵 Supabase Credentials Setup

## Overview
Supabase provides the database, authentication, and Edge Functions for CLO.

---

## 🚀 Setup Steps

### 1. Create Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Project name: `CLO - Chief Life Officer`
4. Generate a strong database password
5. Select region closest to your users

### 2. Get API Credentials
1. Go to Project Settings → API
2. Copy these values:

| Key | Usage | Security Level |
|-----|-------|----------------|
| Project URL | Client + Server | Public |
| Anon Key | Client-side only | Public (RLS protected) |
| Service Role Key | Server-side only | **SECRET** |

### 3. Get CLI Access Token
1. Go to https://supabase.com/dashboard/account/tokens
2. Create new token: `CLO CLI Access`
3. Copy and store securely

---

## 📝 Configuration Templates

### config.json.template
```json
{
  "project_ref": "your_project_ref_here",
  "project_url": "https://your_project_ref.supabase.co",
  "region": "us-east-1",
  "db": {
    "host": "db.your_project_ref.supabase.co",
    "port": 5432,
    "name": "postgres"
  },
  "auth": {
    "email_enabled": true,
    "google_oauth_enabled": true,
    "magic_link_enabled": true
  }
}
```

---

## 🔐 Security Configuration

### Row Level Security (RLS)
All tables must have RLS enabled. Key policies:
- `profiles`: Users can only read/update their own profile
- `items`: Users can only CRUD their own items
- `item_circles`: Cascade from items ownership
- `relationship_capsules`: Both users can access shared capsule

### Auth Settings
1. Go to Authentication → Settings
2. Configure:
   - Site URL: `clo://` (for deep linking)
   - Redirect URLs: 
     - `clo://auth/callback`
     - `http://localhost:8081/auth/callback`
     - `https://*.app.github.dev/auth/callback`

---

## 🔄 Database Migrations

### Running Migrations
```bash
cd clo

# Apply all migrations
supabase db push

# Or run specific migration
psql -h db.YOUR_REF.supabase.co -p 5432 -U postgres -d postgres -f supabase/schema.sql
```

### Migration Order
1. `schema.sql` - Core tables (profiles, items)
2. `schema_relationships.sql` - Relationship capsules
3. `schema_home.sql` - Home OS features

---

## 🔌 Edge Functions

### Setting Secrets
```bash
# OpenAI for AI features
supabase secrets set OPENAI_API_KEY=sk-...

# Future integrations
supabase secrets set OPENWEATHERMAP_API_KEY=...
supabase secrets set RESEND_API_KEY=...

# List all secrets
supabase secrets list
```

### Deploying Functions
```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy enrich-inventory-item
```

---

## 📊 Connection Strings

### Direct Connection (Migrations)
```
postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
```

### Pooler Connection (App Runtime)
```
postgresql://postgres.[REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

## ⚠️ Important Notes

1. **Never use Service Role Key client-side** - It bypasses RLS
2. **Use Anon Key for all client code** - RLS protects data
3. **Enable MFA for Supabase account** - Protect your dashboard
4. **Backup database regularly** - Use pg_dump or Supabase backups

---

## 🆘 Troubleshooting

### "JWT expired"
- Check token expiration settings in Auth config
- Ensure client handles token refresh

### "RLS policy violation"
- Verify user is authenticated
- Check policy conditions match user_id

### "Connection refused"
- Verify project is not paused
- Check if you're using pooler for many connections

---

## 📅 Last Updated
- **Date**: January 29, 2026
- **Version**: 1.0
