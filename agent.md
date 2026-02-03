# 🤖 Agent Behavioral & Architectural Protocols for CLO

> **This document is the primary source of truth for AI coding agents working on CLO.**
> 
> **CRITICAL**: Before ANY implementation, review relevant documentation. After ANY implementation, verify against documentation and update as needed.

---

## 📋 Table of Contents

1. [Pre-Implementation Protocol](#1-pre-implementation-protocol)
2. [Post-Implementation Protocol](#2-post-implementation-protocol)
3. [Core Philosophy](#3-core-philosophy)
4. [Code Standards](#4-code-standards)
5. [Architecture Patterns](#5-architecture-patterns)
6. [Security Checkpoints](#6-security-checkpoints)
7. [Design System Rules](#7-design-system-rules)
8. [Data Architecture](#8-data-architecture)
9. [Navigation Philosophy](#9-navigation-philosophy)
10. [Performance Requirements](#10-performance-requirements)
11. [Module Protocols](#11-module-protocols)
12. [Edge Function Patterns](#12-edge-function-patterns)
13. [Testing Protocols](#13-testing-protocols)
14. [Auto-Learning System](#14-auto-learning-system)
15. [File Naming Conventions](#15-file-naming-conventions)
16. [Error Handling Patterns](#16-error-handling-patterns)
17. [Accessibility Standards](#17-accessibility-standards)

---

## 1. Pre-Implementation Protocol

### ⚠️ MANDATORY BEFORE EVERY TASK

Before writing ANY code, the agent MUST:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRE-IMPLEMENTATION                        │
├─────────────────────────────────────────────────────────────┤
│ 1. READ THIS FILE (agent.md) - Refresh context              │
│ 2. CHECK .audit/TECH_DEBT.md - Related issues?              │
│ 3. CHECK .audit/decisions/ - Relevant ADRs?                 │
│ 4. CHECK .audit/CODE_REVIEW.md - Patterns to follow?        │
│ 5. REVIEW related source files - Understand context         │
│ 6. IDENTIFY affected types - Check /types/ directory        │
│ 7. VERIFY credentials needed - Check .credentials/          │
└─────────────────────────────────────────────────────────────┘
```

### Checklist Before Coding

- [ ] I have read the relevant sections of `agent.md`
- [ ] I have checked `TECH_DEBT.md` for related issues
- [ ] I understand the existing code patterns
- [ ] I know which files will be affected
- [ ] I have identified required types/interfaces
- [ ] I understand the security implications
- [ ] I have a clear implementation plan

### Context Gathering Questions

Ask yourself:
1. **What circle does this affect?** (Self, Relationships, Home, Dashboard)
2. **What layer does this belong to?** (View, Component, Hook, Service)
3. **Does this need real-time updates?** (Supabase Realtime)
4. **Does this handle sensitive data?** (RLS, encryption)
5. **Is there existing code I can reuse?**

---

## 2. Post-Implementation Protocol

### ⚠️ MANDATORY AFTER EVERY TASK

After completing ANY implementation, the agent MUST:

```
┌─────────────────────────────────────────────────────────────┐
│                   POST-IMPLEMENTATION                        │
├─────────────────────────────────────────────────────────────┤
│ 1. VERIFY code compiles (TypeScript check)                  │
│ 2. VERIFY no new lint errors                                │
│ 3. TEST the implementation manually                         │
│ 4. CHECK for unintended side effects                        │
│ 5. UPDATE .audit/CHANGELOG.md                               │
│ 6. UPDATE .audit/TECH_DEBT.md (if new debt introduced)      │
│ 7. UPDATE types/ if interfaces changed                      │
│ 8. UPDATE this file if patterns changed                     │
│ 9. DOCUMENT complex logic with comments                     │
└─────────────────────────────────────────────────────────────┘
```

### Post-Implementation Checklist

- [ ] TypeScript compiles without errors
- [ ] No new `any` types introduced
- [ ] Error states are handled
- [ ] Loading states are handled
- [ ] Haptic feedback added (for interactions)
- [ ] Accessibility labels added
- [ ] Console.log wrapped in __DEV__
- [ ] CHANGELOG.md updated
- [ ] TECH_DEBT.md updated (if applicable)
- [ ] Documentation updated (if applicable)

### Verification Commands

```bash
# TypeScript check
cd clo && npx tsc --noEmit

# Lint check
cd clo && npm run lint

# Start app to verify
cd clo && npm start
```

---

## 3. Core Philosophy

### The "Sanctuary" Mindset

CLO is not just an app—it's a private sanctuary for life data. Every decision must reflect this:

| Principle | Implementation |
|-----------|----------------|
| **Privacy First** | No social features, no data sharing, no analytics tracking |
| **Calm UX** | Slow animations (500ms+), muted colors, no aggressive notifications |
| **Mobile First** | Touch targets 44px+, thumb-friendly layouts, offline-capable |
| **Three Circles** | Self, Relationships, Home—everything maps to these |

### User Privacy is Paramount

- **Never** leak data between users
- **Always** verify RLS policies
- **Never** log sensitive user data
- **Always** encrypt Vault and Chat content

### The "Venn" Logic

Data flows through the three circles. An item can belong to multiple circles:

```
        ┌───────────────┐
        │     SELF      │
        │   (Indigo)    │
        └───────┬───────┘
                │
    ┌───────────┼───────────┐
    │           │           │
┌───▼───┐   ┌───▼───┐   ┌───▼───┐
│ HOME  │   │SHARED │   │ RELS  │
│(Sage) │   │ ITEM  │   │(Terra)│
└───────┘   └───────┘   └───────┘
```

---

## 4. Code Standards

### TypeScript Requirements

```typescript
// ✅ GOOD: Explicit types, no any
interface UserProfile {
  id: string;
  name: string;
  createdAt: Date;
}

function getUser(id: string): Promise<UserProfile> {
  // Implementation
}

// ❌ BAD: Using any
function getUser(id: any): Promise<any> {
  // Never do this
}
```

### File Organization

```
/app         → Expo Router routes ONLY (no business logic)
/views       → Screen composition components
/components  → Reusable UI elements by feature
/hooks       → Data fetching, business logic
/services    → API calls, external integrations
/lib         → Core utilities (supabase, haptics)
/providers   → React context providers
/store       → Zustand stores
/types       → TypeScript definitions
/constants   → App-wide constants
```

### Import Order

```typescript
// 1. React/React Native
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

// 2. External packages
import { useQuery } from '@tanstack/react-query';
import Animated from 'react-native-reanimated';

// 3. Internal imports (absolute)
import { supabase } from '@/lib/supabase';
import { useItems } from '@/hooks/useItems';

// 4. Relative imports
import { ItemCard } from './ItemCard';
```

### Error Handling Standard

```typescript
// ✅ GOOD: Graceful degradation
try {
  const data = await fetchExternalAPI();
  return data;
} catch (error) {
  console.error(__DEV__ ? error : 'External API failed');
  return getCachedData() ?? getDefaultData();
}

// ❌ BAD: Crashing on error
const data = await fetchExternalAPI(); // Will crash if fails
```

---

## 5. Architecture Patterns

### Layer Responsibilities

| Layer | Responsibility | Example |
|-------|----------------|---------|
| **App (Routes)** | URL structure, navigation | `app/(main)/index.tsx` |
| **Views** | Screen composition, layout | `views/DashboardView.tsx` |
| **Components** | Reusable UI, presentation | `components/items/ItemCard.tsx` |
| **Hooks** | Data fetching, mutations | `hooks/useItems.ts` |
| **Services** | API calls, business logic | `services/pulseService.ts` |
| **Lib** | Core utilities | `lib/supabase.ts` |

### Data Flow

```
User Action
    ↓
Component (UI event handler)
    ↓
Hook (useMutation/useQuery)
    ↓
Service (API call)
    ↓
Supabase/Edge Function
    ↓
Response bubbles back up
```

### State Management Decision Tree

```
Is the data from a server?
├─ YES → Use TanStack Query
│        └─ Need optimistic updates? → useMutation with onMutate
│
└─ NO → Is it UI state?
         ├─ YES → Is it shared across components?
         │        ├─ YES → Use Zustand
         │        └─ NO → Use useState
         │
         └─ NO → Is it auth-related?
                  └─ YES → Use AuthContext
```

---

## 6. Security Checkpoints

### RLS Policy Template

```sql
-- Every table MUST have these minimum policies
CREATE POLICY "Users can only see their own data"
ON table_name FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own data"
ON table_name FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own data"
ON table_name FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own data"
ON table_name FOR DELETE
USING (auth.uid() = user_id);
```

### Auth Requirements

- ✅ MFA support required
- ✅ Biometric lock after 2 min inactivity
- ✅ Session refresh handling
- ✅ Secure token storage (expo-secure-store)

### Data Classification

| Classification | Examples | Requirements |
|----------------|----------|--------------|
| **Public** | App name, version | None |
| **Internal** | User ID, email | RLS protection |
| **Sensitive** | Messages, notes | RLS + audit log |
| **Vault** | Shared secrets | RLS + E2EE + Two-Key |

---

## 7. Design System Rules

### Typography

- **Font Family**: Outfit (humanist sans-serif)
- **Never**: Bold, aggressive text
- **Always**: Comfortable line height (1.5+)

### Colors (Dark Mode Default)

```typescript
const colors = {
  // Backgrounds
  background: '#121212',    // Deep Charcoal
  surface: '#1E1E1E',       // Card backgrounds
  
  // Text
  textPrimary: '#E0E0E0',
  textSecondary: '#A0A0A0',
  
  // Circle Accents
  self: '#6366f1',          // Indigo
  relationships: '#e17055', // Terracotta
  home: '#84a98c',          // Sage
  dashboard: '#2d3436',     // Charcoal
  
  // Semantic
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
};
```

### Animations

```typescript
import { Easing, withTiming } from 'react-native-reanimated';

// Standard transition
const ANIMATION = {
  duration: 500,
  easing: Easing.inOut(Easing.ease),
};

// Usage
const animatedStyle = useAnimatedStyle(() => ({
  opacity: withTiming(isVisible ? 1 : 0, ANIMATION),
}));
```

### Haptic Patterns

```typescript
import * as Haptics from 'expo-haptics';

// Tab switch, selection change
Haptics.selectionAsync();

// Task completed, success action
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Delete, error, warning
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

// Pull to refresh, significant action
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
```

---

## 8. Data Architecture

### Universal Item Pattern

```typescript
interface Item {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  item_type: 'TASK' | 'NOTE' | 'EVENT' | 'MEMORY';
  status: string;
  due_date: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Items can belong to multiple circles
interface ItemCircle {
  item_id: string;
  circle: 'SELF' | 'RELATIONSHIPS' | 'HOME';
}
```

### Relationship Capsule Pattern

```typescript
interface RelationshipCapsule {
  id: string;
  user_a_id: string;
  user_b_id: string;
  status: 'pending' | 'active' | 'paused' | 'ended';
  health_score: number;
  created_at: string;
}

// Capsule Zones
// 1. Pulse - Relationship health
// 2. Plan - Shared calendar/tasks
// 3. Chat - E2EE messaging
// 4. Vault - Two-key storage
```

### HomeOS Pattern

```typescript
interface Property {
  id: string;
  user_id: string;
  name: string;
  is_primary: boolean;
}

// All home items belong to a property
interface InventoryItem {
  id: string;
  property_id: string;
  name: string;
  warranty_months: number;
  // ...
}
```

---

## 9. Navigation Philosophy

### No Tab Bar

CLO uses gesture-based "Orbital Control":

```
              ↑ SWIPE UP
              (Home)
                │
  SWIPE LEFT ←─┼─→ SWIPE RIGHT
    (Self)     │   (Relationships)
               │
          ┌────┴────┐
          │   TAP   │
          │(Dashboard)
          └─────────┘
```

### View Transitions

- **Never**: Push/pop navigation
- **Always**: Cross-fade between views
- **Duration**: 500ms minimum
- **Easing**: `Easing.inOut(Easing.ease)`

### Contextual Theming

Background color shifts based on active circle:
- Dashboard: Charcoal (#2d3436)
- Self: Darkened Indigo
- Relationships: Darkened Terracotta
- Home: Darkened Sage

---

## 10. Performance Requirements

### Lists

```typescript
// ✅ GOOD: FlatList with optimization
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <ItemCard item={item} />}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews
/>

// ❌ BAD: Mapping in ScrollView
<ScrollView>
  {items.map(item => <ItemCard key={item.id} item={item} />)}
</ScrollView>
```

### Data Fetching

```typescript
// ✅ GOOD: Optimistic updates
const mutation = useMutation({
  mutationFn: updateItem,
  onMutate: async (newItem) => {
    await queryClient.cancelQueries(['items']);
    const previous = queryClient.getQueryData(['items']);
    queryClient.setQueryData(['items'], old => 
      old.map(item => item.id === newItem.id ? newItem : item)
    );
    return { previous };
  },
  onError: (err, newItem, context) => {
    queryClient.setQueryData(['items'], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries(['items']);
  },
});
```

### External API Aggregation

```typescript
// ✅ GOOD: Don't let one slow API block others
const results = await Promise.allSettled([
  fetchCalendar(),
  fetchWeather(),
  fetchHealth(),
]);

// Process each result individually
results.forEach((result, index) => {
  if (result.status === 'fulfilled') {
    // Use data
  } else {
    // Use cached data or default
  }
});
```

---

## 11. Module Protocols

### Self Circle

**Features**: Vibe Check, Burn Box, Gratitude, Focus Timer, Lists

**Key Tables**: `vibe_checks`, `burn_box_entries`, `gratitude_entries`

**Patterns**:
- Vibe Check uses Russell's Circumplex Model (valence + arousal)
- Burn Box entries are DELETED after "burning" (cathartic destruction)
- Focus Timer uses local state (not synced)

### Relationships Circle (Capsule Architecture)

**Features**: Capsules, Pulse, Chat, Vault, Plan

**Key Tables**: `relationship_capsules`, `capsule_messages`, `vault_items`

**Patterns**:
- Capsule requires both users to accept
- Chat uses Supabase Realtime
- Vault uses Two-Key encryption
- AI Mediator only speaks when invoked

#### The "Two-Key" Rule
- Any data in `vault_items` MUST be encrypted client-side
- Access to a Capsule requires `user_id` to match either `user_a_id` or `user_b_id`

#### The "Handshake" Protocol
1. User A enters email to invite User B
2. User B receives secure magic link
3. Upon acceptance, `relationship_capsules` binding is created
4. Both users see the shared Capsule in their Relationships circle

### Home Circle (HomeOS/CHO Dashboard)

**Features**: Inventory, Subscriptions, Vendors, Maintenance, Properties

**Key Tables**: `properties`, `inventory_items`, `subscriptions`, `vendors`

**Patterns**:
- All items scoped to a property
- AI enrichment via Edge Functions
- "Kill Switch" generates cancellation letters
- Fuzzy search via `pg_trgm`

### Dashboard

**Features**: Daily Agenda, Sticky Notes, Weather, Health, Sync

**Key Pattern**: Aggregates from all circles, shows unified view

---

## 12. Edge Function Patterns

### Structure

```
supabase/functions/
├── enrich-inventory-item/    # AI product lookup
├── generate-cancellation/    # AI cancel letter
├── get-calendar/            # Calendar sync
├── get-health/              # Health data
├── get-weather/             # Weather API
└── send-invite-email/       # Capsule invites
```

### Template

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth header");

    // Get secrets
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    
    // Business logic here
    
    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

### Requirements
- Always handle CORS headers
- Use `response_format: { type: "json_object" }` for OpenAI calls
- Store API keys in Supabase Secrets, never in code
- Return structured JSON matching TypeScript interfaces

---

## 13. Testing Protocols

### Manual Testing Checklist

- [ ] RLS: Attempt cross-user data access (should fail)
- [ ] Biometrics: Background app for 2+ minutes
- [ ] Offline: Disable network, verify cached data shows
- [ ] Haptics: Test on physical device (not simulator)
- [ ] Deep links: Test `clo://` scheme opens correctly

### Future: Automated Tests

```typescript
// Unit test pattern (Jest)
describe('useItems', () => {
  it('fetches items for the current user', async () => {
    // Setup
    // Action
    // Assert
  });
});
```

---

## 14. Auto-Learning System

### Learning from Mistakes

When an error occurs:

1. **Document in TECH_DEBT.md** if it's a systemic issue
2. **Add to CODE_REVIEW.md** if it's a pattern to avoid
3. **Update this file** if it's a new protocol

### Learning from Successes

When a pattern works well:

1. **Add to CODE_REVIEW.md** as "Good Pattern to Follow"
2. **Extract to shared utility** if reusable
3. **Document in this file** if it's a new standard

### Knowledge Capture Template

```markdown
## Lesson Learned: [Title]

**Date**: YYYY-MM-DD
**Context**: What were we trying to do?
**Issue**: What went wrong (or right)?
**Resolution**: How was it fixed?
**Prevention**: How do we prevent/replicate this?
```

### Continuous Improvement Cycle

```
┌─────────────────────────────────────────┐
│                IMPLEMENT                 │
│        (Following this guide)            │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│                 VERIFY                   │
│         (Post-implementation)            │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│                 LEARN                    │
│     (Document what worked/didn't)        │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│                UPDATE                    │
│       (Improve this guide)               │
└─────────────────┬───────────────────────┘
                  │
                  └──────────► IMPLEMENT (repeat)
```

---

## 15. File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Components | `PascalCase.tsx` | `ItemCard.tsx` |
| Hooks | `useCamelCase.ts` | `useItems.ts` |
| Services | `camelCaseService.ts` | `pulseService.ts` |
| Types | `camelCase.ts` | `database.ts` |
| Views | `PascalCaseView.tsx` | `SelfView.tsx` |
| Constants | `camelCase.ts` | `theme.ts` |
| Utils | `camelCase.ts` | `formatters.ts` |

---

## 16. Error Handling Patterns

### Service Layer

```typescript
// Return Result type
type Result<T> = { success: true; data: T } | { success: false; error: string };

async function fetchItems(): Promise<Result<Item[]>> {
  try {
    const { data, error } = await supabase.from('items').select();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (e) {
    return { success: false, error: 'Network error' };
  }
}
```

### Hook Layer

```typescript
// Expose loading/error states
const { data, isLoading, error } = useQuery({
  queryKey: ['items'],
  queryFn: fetchItems,
});
```

### Component Layer

```typescript
if (isLoading) return <Skeleton />;
if (error) return <ErrorState message={error.message} onRetry={refetch} />;
if (!data?.length) return <EmptyState />;
return <ItemList data={data} />;
```

---

## 17. Accessibility Standards

### Required Props

```typescript
// All interactive elements MUST have:
<TouchableOpacity
  accessibilityLabel="Delete item"
  accessibilityRole="button"
  accessibilityHint="Double tap to delete this item"
>
```

### Color Contrast

- Text on background: Minimum 4.5:1 ratio
- Large text: Minimum 3:1 ratio
- Use colorblind-friendly palettes

### Touch Targets

- Minimum size: 44x44 points
- Spacing between targets: 8 points minimum

---

## 📚 Quick Reference

### Documentation Map

| Need To... | Check... |
|------------|----------|
| Understand architecture | `agent.md` (this file) |
| See what's changed | `.audit/CHANGELOG.md` |
| Find technical debt | `.audit/TECH_DEBT.md` |
| See code patterns | `.audit/CODE_REVIEW.md` |
| Understand past decisions | `.audit/decisions/` |
| Get credential info | `.credentials/` |
| Deploy to production | `.audit/checklists/pre-deploy.md` |
| Security review | `.audit/checklists/security-review.md` |

### Emergency Contacts

- Supabase issues: Check dashboard status
- Build failures: Check Expo/EAS dashboard
- Security incidents: Document in `.audit/incidents/`

---

## 📅 Document Version

- **Version**: 2.0
- **Last Updated**: January 29, 2026
- **Major Changes**: Added pre/post implementation protocols, auto-learning system

---

**Remember**: This document is living. Update it as the project evolves. If something is unclear or wrong, fix it immediately.
