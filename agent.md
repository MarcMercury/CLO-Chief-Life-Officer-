# Agent Behavioral & Architectural Protocols for CLO

## 1. Core Philosophy
- **User Privacy is Paramount:** Never leak data between users. Always verify Row Level Security (RLS) policies.
- **The "Sanctuary" Vibe:** UI transitions must be slow and organic (fade-ins, not pop-ups). Colors must be muted.
- **Mobile First:** All layouts must be optimized for touch targets (44px+) and thumb zones.
- **Three Circles:** Self (personal), Relationships (1:1 connections), Home (physical environment).

## 2. Code Standards
- **TypeScript:** Use strict typing. No `any` types allowed. Define Interfaces for all Data Models.
- **Modularity:** Separation of concerns.
  - `/app`: Routing (Expo Router).
  - `/components`: Reusable UI elements.
  - `/services`: API calls and external integrations.
  - `/hooks`: Custom React hooks for logic.
  - `/views`: Main screen content components.
- **Error Handling:** Fail gracefully. If an external API (e.g., Spotify) fails, the app must not crash; it should show a "cached" state or a subtle warning.

## 3. The "Venn" Logic
- Data is not siloed. An item (Task, Note, Event) creates a relationship to a Circle.
- Use a `junction table` approach for items belonging to multiple circles.
- **The Pulse:** The sync function must be performant. Use `Promise.allSettled` for aggregating external data to prevent one slow API from blocking the UI.

## 4. Security Checkpoints
- **Authentication:** Must support MFA (Multi-Factor Authentication).
- **Session Management:** Auto-lock app after 2 minutes of inactivity (require FaceID/Biometrics to re-enter).
- **E2EE:** End-to-end encryption for Relationship Capsule messages and Vault items.
- **Two-Key Vault:** Shared sensitive data requires both users to agree on a PIN.

## 5. Design System Rules
- **Typography:** Use humanist sans-serif (Outfit or similar). No bold, aggressive text.
- **Colors (Dark Mode Default):**
  - Background: `#121212` (Deep Charcoal)
  - Surface Cards: `#1E1E1E`
  - Text Primary: `#E0E0E0`
  - Text Secondary: `#A0A0A0`
  - Self Accent: Indigo `#6366f1`
  - Relationships Accent: Terracotta `#e17055`
  - Home Accent: Sage `#84a98c`
  - Dashboard: Charcoal `#2d3436`
- **Animations:** Use `react-native-reanimated`. All transitions must be organic (500ms duration minimum).
- **Haptics:** Use `expo-haptics` for all meaningful interactions.
  - Tab Switch: `SelectionAsync` (Light tick)
  - Task Complete: `NotificationAsync(Success)` (Satisfying thud)
  - Delete/Warning: `NotificationAsync(Error)` (Double buzz)
  - Pull to Refresh: `ImpactAsync(Medium)`

## 6. Data Architecture
- **Items Table:** Universal storage for tasks, notes, events.
- **Item Circles:** Junction table for multi-circle assignments.
- **RLS Policies:** Every query must filter by `auth.uid()`.

## 7. Navigation Philosophy
- No standard tab bar.
- "Orbital Control" gesture-based navigation.
- Cross-fade between views, never push/pop.
- Contextual theming: background color changes based on active circle.

## 8. Performance Requirements
- Lists must use `FlatList` with proper `keyExtractor`.
- Optimistic updates for all mutations.
- Skeleton loaders during data fetching.
- Background sync via Edge Functions, not on device.

## 9. Relationship Module Protocols (The "Capsule" Architecture)

### The "Two-Key" Rule
- Any data in `vault_items` MUST be encrypted client-side. Even database admins should not be able to read it.
- Access to a Capsule requires `user_id` to match either `user_a_id` or `user_b_id`. Strict RLS.

### Real-Time Expectations
- Chat and Shared Tasks must use Supabase Realtime (Subscriptions) so updates happen instantly without refreshing.

### AI Boundaries
- The AI Mediator (`@CLO`) is helpful, not intrusive.
- It only speaks when invoked or when sentiment analysis detects "High Friction" (optional future feature).

### The "Handshake" Protocol
1. User A enters email to invite User B.
2. User B receives secure magic link.
3. Upon acceptance, `relationship_capsules` binding is created.
4. Both users see the shared Capsule in their Relationships circle.

### Capsule Zones
1. **The Pulse (Home):** Vibe check, relationship health indicator
2. **The Plan (Logistics):** Shared calendar, shared tasks
3. **The Chat (Communication):** E2EE messaging with AI mediator option
4. **The Vault (Storage):** Two-key PIN protected sensitive data

### Privacy Constraints (iOS/Android Limitations)
- **Cannot access:** iMessage, WhatsApp, Signal history (OS restrictions)
- **Can access:** Calendar, Contacts, Photos (with permission)
- **Workaround:** Share Extension for importing screenshots/text from other apps

## 10. Home Module Protocols (The "CHO Dashboard")

### The "Chief Household Officer" Logic
- Treat household management like an ERP system.
- Centralize: Inventory, Warranties, Subscriptions, Vendors.

### AI Enrichment Pattern
- When scanning a barcode, call Edge Function to fetch: warranty_months, manual_url, support_phone, maintenance_schedule
- Use `response_format: { type: "json_object" }` for clean AI responses.

### The "Kill Switch" for Subscriptions
- AI generates cancellation emails citing consumer protection laws.
- Store `cancellation_instructions` and `last_drafted_letter` for each subscription.

### Vendor Memory (Fuzzy Search)
- Use PostgreSQL `pg_trgm` extension for typo-tolerant search.
- Search across: vendor names, trades, AND past service log descriptions.
- Show "match_reason" to explain why a result appeared.

### Warranty Tracking
- Visual progress bar showing warranty timeline.
- Automatic alerts when warranty expiring in 30 days.
- Link to PDF manual and support phone.

## 11. Edge Function Patterns

### Structure
```
supabase/functions/
├── enrich-inventory-item/    # Barcode -> AI lookup for manuals/warranty
├── generate-cancellation/    # Subscription -> AI cancel letter
├── analyze-relationship/     # Interaction logs -> Sentiment analysis
└── pulse-sync/              # Aggregate external API data
```

### Requirements
- Always handle CORS headers.
- Use `response_format: { type: "json_object" }` for OpenAI calls.
- Store API keys in Supabase Secrets, never in code.
- Return structured JSON matching TypeScript interfaces.

## 12. Testing Protocols
- Test RLS policies by attempting cross-user data access.
- Test biometric lock by backgrounding app for >2 minutes.
- Test offline mode gracefully (show cached data).
- Test haptics on physical device (not simulator).

## 13. File Naming Conventions
- Components: `PascalCase.tsx` (e.g., `ItemCard.tsx`)
- Hooks: `useCamelCase.ts` (e.g., `useItems.ts`)
- Services: `camelCaseService.ts` (e.g., `pulseService.ts`)
- Types: `camelCase.ts` in `/types` directory
- Views: `PascalCaseView.tsx` (e.g., `SelfView.tsx`)
