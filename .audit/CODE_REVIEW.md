# 📝 Code Review Observations

> Documented patterns, anti-patterns, and quality observations from code reviews.

---

## ✅ Good Patterns to Follow

### 1. Separation of Concerns
**Location**: Project structure
```
views/     → Screen layout and composition
components/ → Reusable UI elements
hooks/     → Data fetching and business logic
services/  → API calls and external integrations
```
**Why it's good**: Makes code easy to find, test, and reuse.

### 2. TypeScript Strict Mode
**Location**: `tsconfig.json`
```json
{
  "compilerOptions": {
    "strict": true
  }
}
```
**Why it's good**: Catches bugs at compile time, not runtime.

### 3. Haptic Feedback Pattern
**Location**: Throughout components
```typescript
import * as Haptics from 'expo-haptics';

// On successful action
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```
**Why it's good**: Consistent tactile feedback improves UX.

### 4. Supabase Client Type Safety
**Location**: `lib/supabase.ts`
```typescript
import { Database } from '@/types/database';
export const supabase = createClient<Database>(url, key);
```
**Why it's good**: Full type inference for database queries.

### 5. Zustand Store Organization
**Location**: `store/uiStore.ts`
```typescript
interface UIStore {
  activeCircle: CircleType;
  setActiveCircle: (circle: CircleType) => void;
}
```
**Why it's good**: Clean, minimal stores with clear actions.

---

## ❌ Anti-Patterns to Avoid

### 1. Inline Styles in JSX
**Avoid**:
```typescript
<View style={{ marginTop: 20, padding: 10, backgroundColor: '#121212' }}>
```
**Prefer**:
```typescript
<View className="mt-5 p-2.5 bg-background">
// Or
<View style={styles.container}>
```

### 2. Any Types
**Avoid**:
```typescript
const data: any = response.json();
function handleEvent(event: any) { }
```
**Prefer**:
```typescript
interface ResponseData { id: string; name: string; }
const data: ResponseData = await response.json();
```

### 3. Nested Ternaries
**Avoid**:
```typescript
{loading ? <Spinner /> : error ? <Error /> : data ? <List /> : <Empty />}
```
**Prefer**:
```typescript
if (loading) return <Spinner />;
if (error) return <Error />;
if (!data?.length) return <Empty />;
return <List data={data} />;
```

### 4. Magic Numbers
**Avoid**:
```typescript
withTiming(1, { duration: 500 })
setTimeout(() => {}, 2000)
```
**Prefer**:
```typescript
import { ANIMATION_DURATION, DEBOUNCE_MS } from '@/constants/timing';
withTiming(1, { duration: ANIMATION_DURATION.FADE })
```

### 5. Prop Drilling Deep
**Avoid**:
```typescript
<Parent user={user} theme={theme}>
  <Child user={user} theme={theme}>
    <Grandchild user={user} theme={theme} />
  </Child>
</Parent>
```
**Prefer**: Use Context or Zustand for deeply shared state.

---

## 🔍 File-Specific Observations

### `/components/relationships/`
- **Positive**: Good modular structure with one component per file
- **Concern**: Some components exceed 250 lines
- **Recommendation**: Extract sub-components for long render methods

### `/hooks/`
- **Positive**: Consistent naming convention (use*.ts)
- **Positive**: Good use of TanStack Query
- **Concern**: Some hooks have mixed responsibilities
- **Recommendation**: One hook per concern (useXQuery, useXMutation)

### `/services/`
- **Positive**: Clear service boundaries
- **Concern**: Inconsistent error handling approaches
- **Recommendation**: Standardize on try/catch with typed errors

### `/supabase/`
- **Positive**: Comprehensive schema with RLS
- **Positive**: Good use of triggers for timestamps
- **Concern**: Some complex queries could be views
- **Recommendation**: Create views for common join patterns

---

## 📊 Metrics from Last Review

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Files with `any` types | 0 | 0 | ✅ |
| Components > 300 lines | 3 | 0 | ⚠️ |
| Hooks > 100 lines | 2 | 0 | ⚠️ |
| Console.log in prod code | 5 | 0 | ⚠️ |
| Unused imports | 8 | 0 | ⚠️ |
| Missing accessibility labels | 20+ | 0 | 🔴 |
| Test coverage | 0% | 80% | 🔴 |

---

## 📋 Review Checklist Template

When reviewing code, check:
- [ ] TypeScript types are explicit (no `any`)
- [ ] Error handling is present for async operations
- [ ] Loading and error states are handled in UI
- [ ] Haptic feedback is used for interactions
- [ ] Animations use shared values (Reanimated)
- [ ] FlatLists have proper keyExtractor
- [ ] Accessibility labels are present
- [ ] No console.log without __DEV__ check
- [ ] Component is under 200 lines
- [ ] Styles use NativeWind classes

---

## 📅 Last Updated
- **Date**: January 29, 2026
- **Reviewer**: System Audit
