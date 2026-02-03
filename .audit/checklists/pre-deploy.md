# 🚀 Pre-Deployment Checklist

Complete all items before deploying to production.

---

## 📋 Code Quality

- [ ] All TypeScript errors resolved (`npm run typecheck`)
- [ ] No `any` types in changed files
- [ ] ESLint passes with no errors (`npm run lint`)
- [ ] No console.log without __DEV__ check
- [ ] All TODOs addressed or tracked in TECH_DEBT.md

## 🧪 Testing

- [ ] Unit tests pass (`npm test`)
- [ ] Integration tests pass
- [ ] Manual testing on iOS device
- [ ] Manual testing on Android device
- [ ] Edge cases tested
- [ ] Error states tested

## 🔐 Security

- [ ] No secrets in code
- [ ] No secrets in commit history
- [ ] RLS policies verified for new tables
- [ ] Input validation present
- [ ] Auth flows tested

## 📱 Platform Specific

### iOS
- [ ] App builds successfully
- [ ] Biometrics work on device
- [ ] Deep links work
- [ ] Push notifications work (if applicable)

### Android
- [ ] App builds successfully
- [ ] Biometrics work on device
- [ ] Deep links work
- [ ] Push notifications work (if applicable)

## 🎨 UI/UX

- [ ] Dark mode appearance correct
- [ ] Animations are smooth (60fps)
- [ ] Haptic feedback works
- [ ] Loading states display properly
- [ ] Error states display properly
- [ ] Accessibility labels present

## 📊 Performance

- [ ] No unnecessary re-renders
- [ ] FlatLists properly optimized
- [ ] Images properly sized
- [ ] Bundle size acceptable

## 📝 Documentation

- [ ] CHANGELOG.md updated
- [ ] README updated if needed
- [ ] New features documented
- [ ] Breaking changes noted

## 🔄 Database

- [ ] Migrations tested locally
- [ ] Migrations tested on staging
- [ ] Rollback plan documented
- [ ] Data backup taken

## 🌐 Edge Functions

- [ ] All Edge Functions deploy successfully
- [ ] Secrets are set in Supabase
- [ ] CORS configured correctly
- [ ] Rate limiting in place

## ✅ Final Checks

- [ ] Version number incremented
- [ ] Build number incremented
- [ ] Staging environment tested
- [ ] Stakeholder approval obtained
- [ ] Deployment time communicated

---

## 🚨 Rollback Plan

If deployment fails:
1. [ ] Rollback build in EAS
2. [ ] Rollback database migrations (if any)
3. [ ] Rollback Edge Functions
4. [ ] Notify users if needed
5. [ ] Document incident in `.audit/incidents/`

---

## 📅 Deployment Log

| Date | Version | Deployer | Notes |
|------|---------|----------|-------|
| YYYY-MM-DD | X.X.X | Name | Notes |

