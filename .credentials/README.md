# 🔐 CLO Credentials Management

> **⚠️ SECURITY WARNING**: This folder contains sensitive credentials and API keys.
> **This folder should NEVER be committed to version control.**

---

## 📁 Folder Structure

```
.credentials/
├── README.md                    # This file - credential management guide
├── .env.template                # Template for environment variables (safe to commit)
├── supabase/
│   ├── README.md               # Supabase-specific setup instructions
│   └── config.json.template    # Template for Supabase config
├── google/
│   ├── README.md               # Google Cloud setup instructions
│   └── oauth-config.json.template
├── openai/
│   ├── README.md               # OpenAI API setup
│   └── config.json.template
├── expo/
│   ├── README.md               # Expo/EAS configuration
│   └── eas-config.json.template
└── integrations/
    ├── README.md               # Future integrations guide
    └── templates/              # Placeholder templates for future services
```

---

## 🚀 Quick Setup Guide

### 1. Initial Setup
```bash
# Copy the environment template
cp .credentials/.env.template clo/.env

# Fill in your actual credentials
nano clo/.env
```

### 2. Supabase Setup
1. Create project at https://supabase.com
2. Copy Project URL and Anon Key to `.env`
3. See `.credentials/supabase/README.md` for detailed instructions

### 3. Google Cloud Setup
1. Create project at https://console.cloud.google.com
2. Enable required APIs (Sign-In, Calendar, People)
3. Create OAuth credentials
4. See `.credentials/google/README.md` for detailed instructions

### 4. Edge Functions Secrets
```bash
# Set secrets for Supabase Edge Functions
supabase secrets set OPENAI_API_KEY=your-key-here
supabase secrets list
```

---

## 🔒 Security Best Practices

### DO ✅
- Use environment variables for all secrets
- Rotate keys regularly (every 90 days recommended)
- Use separate keys for development vs production
- Store production secrets in EAS Secrets or similar
- Keep this folder in `.gitignore`

### DON'T ❌
- Commit actual credentials to version control
- Share API keys in chat/email
- Use production keys in development
- Hardcode secrets in source code
- Log secrets in console output

---

## 📋 Credential Inventory

| Service | Type | Rotation Date | Status | Notes |
|---------|------|---------------|--------|-------|
| Supabase | API Key | - | ✅ Active | Anon key for client |
| Supabase | Service Role | - | ✅ Active | Server-side only |
| Google | OAuth Client | - | ✅ Active | Web client configured |
| OpenAI | API Key | - | ✅ Active | For Edge Functions |
| Expo | Project ID | - | ✅ Active | EAS configured |

---

## 🔄 Key Rotation Procedure

### When to Rotate
- Every 90 days (recommended)
- After team member leaves
- If key is potentially compromised
- Before production launch

### Rotation Steps
1. Generate new key in service dashboard
2. Update in EAS Secrets: `eas env:update`
3. Update local `.env` file
4. Test application functionality
5. Revoke old key
6. Update this inventory

---

## 🆘 Emergency Procedures

### If Credentials Are Compromised
1. **Immediately revoke** the exposed key in service dashboard
2. **Generate new key** and update all environments
3. **Review access logs** for unauthorized usage
4. **Update .gitignore** if credentials were committed
5. **Document incident** in `.audit/incidents/`

### Contact Points
- Supabase Support: https://supabase.com/support
- Google Cloud Support: https://cloud.google.com/support
- OpenAI Support: https://help.openai.com

---

## 📅 Last Audit
- **Date**: January 29, 2026
- **Auditor**: System Audit
- **Status**: All credentials verified
