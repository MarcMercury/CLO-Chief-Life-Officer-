# 🔐 Security Review Checklist

Complete this checklist when reviewing security-sensitive changes.

---

## 🔑 Authentication & Authorization

- [ ] Auth flows use Supabase Auth correctly
- [ ] Session tokens handled securely
- [ ] Biometric unlock implemented properly
- [ ] Auto-lock timeout enforced
- [ ] Logout clears all sensitive data

## 🗄️ Database Security

- [ ] RLS enabled on all tables
- [ ] RLS policies use `auth.uid()` correctly
- [ ] No policies allow access to other users' data
- [ ] Service role key only used in Edge Functions
- [ ] Sensitive columns encrypted (if applicable)

### RLS Policy Verification
```sql
-- Test: User A should NOT see User B's data
-- Set up two test users and verify isolation
```

## 🔐 Data Protection

- [ ] PII (Personally Identifiable Information) identified
- [ ] Sensitive data encrypted at rest
- [ ] Sensitive data encrypted in transit (HTTPS)
- [ ] Vault items use E2EE
- [ ] Chat messages use E2EE

## 🔒 Secrets Management

- [ ] No hardcoded secrets in code
- [ ] No secrets in commit history
- [ ] Environment variables used correctly
- [ ] EAS Secrets configured for production
- [ ] Supabase Secrets configured for Edge Functions

### Secrets Audit
```bash
# Search for potential secrets
grep -r "sk-" --include="*.ts" --include="*.tsx"
grep -r "api_key" --include="*.ts" --include="*.tsx"
grep -r "password" --include="*.ts" --include="*.tsx"
```

## 📥 Input Validation

- [ ] All user inputs sanitized
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (output encoding)
- [ ] File uploads validated
- [ ] Email inputs validated
- [ ] URL inputs validated

## 🌐 API Security

- [ ] Edge Functions validate authentication
- [ ] Edge Functions have rate limiting
- [ ] CORS configured correctly
- [ ] Error messages don't leak sensitive info
- [ ] Request size limits in place

## 📱 Client Security

- [ ] Secure storage used for tokens (`expo-secure-store`)
- [ ] No sensitive data in AsyncStorage
- [ ] No sensitive data logged to console
- [ ] Deep links validated
- [ ] Certificate pinning (optional, for high-security)

## 🔄 Third-Party Security

- [ ] OAuth flows use state parameter
- [ ] Redirect URIs whitelisted
- [ ] Third-party tokens stored securely
- [ ] Third-party SDKs audited

## 📊 Audit & Logging

- [ ] Security events logged
- [ ] Failed auth attempts tracked
- [ ] No sensitive data in logs
- [ ] Logs protected from tampering

## 🔍 Vulnerability Checks

- [ ] `npm audit` shows no critical vulnerabilities
- [ ] Dependencies up to date
- [ ] Known vulnerability databases checked
- [ ] Static analysis tools run (if available)

```bash
# Run security audit
npm audit
```

---

## 🚨 Common Vulnerabilities to Check

### OWASP Mobile Top 10
1. [ ] **Improper Platform Usage** - Using platform features correctly
2. [ ] **Insecure Data Storage** - Sensitive data properly protected
3. [ ] **Insecure Communication** - All traffic encrypted
4. [ ] **Insecure Authentication** - Auth implemented correctly
5. [ ] **Insufficient Cryptography** - Strong crypto used
6. [ ] **Insecure Authorization** - Access controls enforced
7. [ ] **Client Code Quality** - No unsafe code patterns
8. [ ] **Code Tampering** - App integrity protected
9. [ ] **Reverse Engineering** - Code obfuscation (optional)
10. [ ] **Extraneous Functionality** - Debug features removed

---

## ✅ Sign-off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Developer | | | ☐ |
| Security Reviewer | | | ☐ |
| Tech Lead | | | ☐ |

---

## 📅 Last Updated
- **Date**: January 29, 2026
- **Version**: 1.0
