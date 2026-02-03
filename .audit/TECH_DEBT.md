# 🔧 Technical Debt Register

> Track known technical debt, prioritize resolution, and prevent accumulation.

---

## 📊 Summary Dashboard

| Priority | Count | Estimated Hours |
|----------|-------|-----------------|
| 🔴 Critical | 0 | 0 |
| 🟠 High | 3 | 16 |
| 🟡 Medium | 5 | 24 |
| 🟢 Low | 4 | 12 |
| **Total** | **12** | **52** |

---

## 🔴 Critical Priority

*No critical issues at this time.*

---

## 🟠 High Priority

### TD-001: E2EE Implementation Incomplete
- **Location**: `components/relationships/CapsuleChat.tsx`, Vault components
- **Description**: End-to-end encryption is designed but not fully implemented for Chat and Vault
- **Impact**: Sensitive data is not encrypted at rest
- **Suggested Fix**: Implement client-side encryption using `expo-crypto` before storing
- **Effort**: 8 hours
- **Created**: 2026-01-29
- **Status**: Open

### TD-002: Missing Error Boundaries
- **Location**: Throughout app
- **Description**: No React Error Boundaries to catch rendering errors
- **Impact**: Unhandled errors crash the entire app
- **Suggested Fix**: Add ErrorBoundary components at key layout levels
- **Effort**: 4 hours
- **Created**: 2026-01-29
- **Status**: Open

### TD-003: Offline Mode Not Implemented
- **Location**: All data hooks
- **Description**: App requires network connectivity; no offline-first strategy
- **Impact**: App is unusable without internet
- **Suggested Fix**: Implement TanStack Query persistence with AsyncStorage
- **Effort**: 4 hours
- **Created**: 2026-01-29
- **Status**: Open

---

## 🟡 Medium Priority

### TD-004: Magic Numbers in Animations
- **Location**: Various animation components
- **Description**: Animation durations hardcoded (500, 300, etc.)
- **Impact**: Inconsistent animation timing, harder to maintain
- **Suggested Fix**: Create animation constants in `constants/animations.ts`
- **Effort**: 2 hours
- **Created**: 2026-01-29
- **Status**: Open

### TD-005: Duplicate Type Definitions
- **Location**: `types/database.ts`, `types/relationships.ts`, `types/homeos.ts`
- **Description**: Some interfaces are duplicated or inconsistently defined
- **Impact**: Type mismatches, maintenance overhead
- **Suggested Fix**: Consolidate types with proper extends/composition
- **Effort**: 4 hours
- **Created**: 2026-01-29
- **Status**: Open

### TD-006: Missing Loading States
- **Location**: Multiple views
- **Description**: Some views show nothing while loading instead of skeletons
- **Impact**: Poor perceived performance
- **Suggested Fix**: Implement skeleton components for all list views
- **Effort**: 6 hours
- **Created**: 2026-01-29
- **Status**: Open

### TD-007: Inconsistent Error Handling in Services
- **Location**: `services/*.ts`
- **Description**: Some services throw errors, others return null, inconsistent patterns
- **Impact**: Unpredictable error states in UI
- **Suggested Fix**: Standardize on Result type or consistent throw patterns
- **Effort**: 4 hours
- **Created**: 2026-01-29
- **Status**: Open

### TD-008: Large Component Files
- **Location**: Multiple components over 300 lines
- **Description**: Some components are too large and handle too many concerns
- **Impact**: Hard to test and maintain
- **Suggested Fix**: Extract sub-components and custom hooks
- **Effort**: 8 hours
- **Created**: 2026-01-29
- **Status**: Open

---

## 🟢 Low Priority

### TD-009: Console.log Statements in Production
- **Location**: Various files
- **Description**: Debug console.log statements not wrapped in __DEV__ checks
- **Impact**: Minor performance impact, cluttered console
- **Suggested Fix**: Add ESLint rule, wrap in __DEV__
- **Effort**: 2 hours
- **Created**: 2026-01-29
- **Status**: Open

### TD-010: Unused Imports
- **Location**: Various files
- **Description**: Some files have unused imports
- **Impact**: Bundle size slightly larger
- **Suggested Fix**: Add ESLint rule, run auto-fix
- **Effort**: 1 hour
- **Created**: 2026-01-29
- **Status**: Open

### TD-011: Accessibility Labels Missing
- **Location**: Various interactive components
- **Description**: Many buttons/inputs lack `accessibilityLabel`
- **Impact**: Screen reader users cannot use app effectively
- **Suggested Fix**: Audit and add labels to all interactive elements
- **Effort**: 6 hours
- **Created**: 2026-01-29
- **Status**: Open

### TD-012: Test Coverage at 0%
- **Location**: Entire codebase
- **Description**: No unit or integration tests exist
- **Impact**: Regressions go undetected
- **Suggested Fix**: Set up Jest, write tests for critical paths
- **Effort**: 40+ hours (ongoing)
- **Created**: 2026-01-29
- **Status**: Open

---

## ✅ Resolved

*No resolved items yet.*

---

## 📝 Template for New Entries

```markdown
### TD-XXX: Title
- **Location**: File path(s)
- **Description**: What is the issue
- **Impact**: How it affects users/developers
- **Suggested Fix**: How to resolve it
- **Effort**: Estimated hours
- **Created**: YYYY-MM-DD
- **Status**: Open | In Progress | Resolved
```

---

## 📅 Last Updated
- **Date**: January 29, 2026
- **Author**: System Audit
