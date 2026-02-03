# 📝 Code Review Checklist

Use this checklist when reviewing pull requests.

---

## 🎯 General

- [ ] Code solves the problem it's meant to solve
- [ ] Approach makes sense for the use case
- [ ] No obvious bugs or logic errors
- [ ] Code follows existing patterns in codebase
- [ ] Changes are appropriately scoped (not too large)

## 📐 Code Quality

### TypeScript
- [ ] No `any` types used
- [ ] Types are explicitly declared where needed
- [ ] Interfaces used for data shapes
- [ ] Generic types used appropriately
- [ ] No `// @ts-ignore` without explanation

### Naming
- [ ] Variables have meaningful names
- [ ] Functions describe what they do
- [ ] Components named with PascalCase
- [ ] Hooks named with useCamelCase
- [ ] Services named with camelCaseService

### Structure
- [ ] Functions are under 50 lines
- [ ] Components are under 200 lines
- [ ] One component per file
- [ ] Imports are organized (external → internal)
- [ ] No dead/commented code

## ⚛️ React/React Native

- [ ] Hooks follow rules of hooks
- [ ] useEffect has correct dependency array
- [ ] useCallback/useMemo used appropriately (not over-used)
- [ ] Keys provided for list items
- [ ] No inline function definitions in render (when it matters)

## 📱 Mobile Specific

- [ ] Touch targets are 44x44 points minimum
- [ ] Keyboard avoiding behavior correct
- [ ] Safe area insets respected
- [ ] Haptic feedback on interactions
- [ ] Works on both iOS and Android

## 🎨 Styling

- [ ] Uses NativeWind classes (not inline styles)
- [ ] Follows design system colors
- [ ] Responsive to screen sizes
- [ ] Dark mode compatible
- [ ] Consistent spacing

## 🔐 Security

- [ ] No secrets in code
- [ ] User input validated
- [ ] Auth checked where needed
- [ ] RLS policies respected
- [ ] Sensitive data not logged

## 🚀 Performance

- [ ] No unnecessary re-renders
- [ ] FlatList used for long lists
- [ ] Images optimized
- [ ] No memory leaks (cleanup in useEffect)
- [ ] Animations use native driver (Reanimated)

## ♿ Accessibility

- [ ] accessibilityLabel on interactive elements
- [ ] accessibilityRole specified
- [ ] Color contrast sufficient
- [ ] Touch targets large enough
- [ ] Screen reader tested (optional)

## 🧪 Testing

- [ ] Tests written for new functionality
- [ ] Tests pass
- [ ] Edge cases covered
- [ ] Error cases handled

## 📝 Documentation

- [ ] Complex logic explained with comments
- [ ] JSDoc for public functions
- [ ] README updated if needed
- [ ] CHANGELOG entry added

## 🗄️ Data Layer

- [ ] Supabase queries are efficient
- [ ] RLS policies work for new tables
- [ ] TanStack Query cache invalidated properly
- [ ] Optimistic updates implemented
- [ ] Error states handled

## 🔄 State Management

- [ ] Correct state location (server vs UI)
- [ ] No prop drilling (use context/stores)
- [ ] State updates are atomic
- [ ] No stale closures

---

## 💬 Review Comments Guide

### Severity Levels
- 🔴 **Blocker**: Must fix before merge
- 🟠 **Major**: Should fix before merge
- 🟡 **Minor**: Nice to fix, can merge
- 🟢 **Nit**: Stylistic, optional

### Comment Format
```
[Severity] Description

Optional: Suggested fix or alternative
```

### Examples
```
🔴 This will cause a crash when data is null.
Consider adding optional chaining: `data?.items`

🟡 This function is getting long. 
Consider extracting the validation logic.

🟢 Nit: Prefer `const` over `let` here since it's not reassigned.
```

---

## ✅ Approval Criteria

To approve a PR:
- [ ] No 🔴 blockers remain
- [ ] All 🟠 major issues addressed or acknowledged
- [ ] Code runs locally without errors
- [ ] Tests pass
- [ ] Reviewer understands the changes

---

## 📅 Last Updated
- **Date**: January 29, 2026
- **Version**: 1.0
