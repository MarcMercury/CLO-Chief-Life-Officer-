# CLO Development Phases - Execution Guide

This document contains detailed prompts for each development phase. Copy and paste these to your coding agent one at a time.

---

## ✅ Phase 1: Authentication & Foundation - COMPLETE

The following has been implemented:
- Expo + React Native project with TypeScript
- Supabase client configuration
- Complete database schema with RLS policies
- Email + Google OAuth authentication
- Biometric lock screen (Face ID / Touch ID)
- Zustand for UI state management
- TanStack Query for server state
- Expo Router navigation setup

---

## 📍 Phase 2: The "Orbital" Navigation & Dynamic Themes

**Status**: Ready to implement next

### Copy/Paste Prompt for Agent:

```
I need you to build the core navigation structure of CLO. We are NOT using a standard Tab Bar. We are using a custom "State-Based" navigation system where the "Active Circle" determines the UI theme and content.

## 1. State Management (Zustand)
The store already exists at `store/uiStore.ts` with:
- State: `activeCircle` (Enum: 'SELF', 'RELATIONSHIPS', 'HOME', 'DASHBOARD')
- State: `themeColor` (Derived from active circle)
- Actions: `setActiveCircle(circle)`, `resetToDashboard()`

## 2. The Layout Wrapper
Update `app/(main)/_layout.tsx`:
- Listen to the `uiStore`
- Wrap content in `Animated.View` (react-native-reanimated) that changes background color smoothly (500ms duration) based on `themeColor`
- Background must be subtle/dark (darken the accent colors by 80%)

## 3. The "Orbital Control" Component
Create `components/navigation/OrbitalControl.tsx` at bottom center:
- Visual: A circular button (60px) containing the CLO logo/icon
- Gestures (Use `react-native-gesture-handler`):
  - **Tap**: Triggers `setActiveCircle('DASHBOARD')`
  - **Swipe Left**: Triggers `setActiveCircle('SELF')`
  - **Swipe Right**: Triggers `setActiveCircle('RELATIONSHIPS')`
  - **Swipe Up**: Triggers `setActiveCircle('HOME')`
- Feedback: Use `expo-haptics` (SelectionAsync) on every successful swipe

## 4. The Screen Logic
Update `app/(main)/index.tsx` to render different views based on `uiStore` state:
- Create 4 placeholder components:
  - `views/SelfView.tsx`
  - `views/RelationshipsView.tsx`
  - `views/HomeView.tsx`
  - `views/DashboardView.tsx`
- Use `Animated.View` to fade between views (cross-fade effect, not push/pop)

## Technical Constraints
- Ensure `GestureDetector` wraps the Orbital Control properly
- Ensure the app layout is wrapped in `GestureHandlerRootView` (already done in `app/_layout.tsx`)
- Use smooth easing for all animations (`Easing.inOut`)
```

---

## 📍 Phase 3: The Universal "Item" System

**Status**: Implement after Phase 2 is tested

### Copy/Paste Prompt for Agent:

```
Now that navigation works, we need the ability to add and view data. We will implement the "Universal Item" system using Supabase and TanStack Query.

## 1. Supabase Types
The TypeScript definitions already exist in `types/database.ts`. Use the `Item` and `ItemWithCircles` types.

## 2. The "Create Item" Modal
Create `components/modals/CreateItemModal.tsx`:
- UI: A minimal modal that slides up from the bottom (keyboard avoiding)
- Inputs:
  - `Title` (TextInput, auto-focus)
  - `Type Selector`: Row of icons for [Task, Note, Event]
  - `Circle Toggle`: Three toggle buttons (Self, Rel, Home) - An item can belong to multiple circles
- Action: "Save" button

## 3. Data Hooks (TanStack Query)
Create `hooks/useItems.ts`:
- **Query**: `useItems(circleContext)`
  - Fetch items from `items` table
  - Join with `item_circles` to filter based on `circleContext`
  - Sort by `created_at` descending
- **Mutation**: `useCreateItem()`
  - Insert into `items` table
  - Insert into `item_circles` table for each selected circle
  - On success: Invalidate `['items']` query key
  - On success: Trigger `Haptics.notificationAsync(Success)`

## 4. The Item Card Component
Create `components/items/ItemCard.tsx`:
- Props: `item: ItemWithCircles`
- Design: Glassmorphism style (slightly transparent background)
- Show: Title, colored dots for circles
- If `type === 'TASK'`, show checkbox that updates `status` to 'COMPLETED'

## 5. Integration
- Embed `CreateItemModal` in main layout (triggered by "+" button near Orbital Control)
- In each view (`SelfView.tsx`, etc.), implement `<FlatList>` using `useItems(circle)`

## Technical Constraints
- Use **Optimistic Updates** for checkbox
- Implement `KeyboardAvoidingView` with behavior 'padding'
- Ensure RLS is respected (handle 401 errors gracefully)
```

---

## 📍 Phase 3.5: Relationship Capsules ("Two-Player Mode")

**Status**: Implement after Phase 3

### Copy/Paste Prompt for Agent:

```
We are building the "Relationship Capsule" system - a private, two-person space for each significant relationship. This is the core of the Relationships circle.

## Background Context
The database schema already exists in `supabase/schema_relationships.sql`. Apply it to create:
- `relationship_capsules` (the binding between two users)
- `interaction_logs`, `open_loops`, `emotional_logs`
- `shared_tasks`, `vault_items` (E2EE), `capsule_messages` (E2EE chat)

## 1. Capsule List View
Update `views/RelationshipsView.tsx`:
- Query `relationship_capsules` where user is `user_a_id` OR `user_b_id` AND status = 'active'
- Display partner's name (join with `profiles` table)
- Show "relationship health" indicator (colored ring: green/yellow/red based on days_since_meaningful_interaction)
- "+" button to create new capsule (invite flow)

## 2. The Invite Flow
Create `components/relationships/InvitePartnerModal.tsx`:
- Input: Partner's email address
- On submit:
  - Generate `invite_code` (UUID)
  - Insert into `relationship_capsules` with status = 'pending'
  - TODO: Send email via Edge Function (for now, just copy code to clipboard)
- Show: "Share this link with [email]"

## 3. The Capsule Detail Screen
Create `app/(main)/capsule/[id].tsx`:
- Uses Expo Router dynamic route
- Layout: Horizontal pager with 4 zones:
  1. **The Pulse** (Home tab) - Relationship health dashboard
  2. **The Plan** - Shared tasks + calendar events
  3. **The Chat** - E2EE messaging with @CLO AI option
  4. **The Vault** - Two-key protected sensitive items

## 4. Zone Components

### Zone 1: The Pulse (`components/relationships/CapsulePulse.tsx`)
- Large circular "Vibe Check" indicator
- "Days since meaningful interaction" counter
- Quick log buttons: "We talked", "We met", "We argued"
- Mood history chart (last 30 days)

### Zone 2: The Plan (`components/relationships/CapsulePlan.tsx`)
- Shared task list (real-time sync with Supabase)
- Query: `shared_tasks` where `capsule_id = :id`
- Add task: Insert with `created_by = auth.uid()`
- Toggle completion: Update `completed_at`
- Open loops section (things discussed but not resolved)

### Zone 3: The Chat (`components/relationships/CapsuleChat.tsx`)
- E2EE messaging (client-side encryption before insert)
- Message bubbles with sender alignment
- "Typing" indicator via Supabase Realtime presence
- Special message type: `@CLO` triggers AI mediator response

### Zone 4: The Vault (`components/relationships/CapsuleVault.tsx`)
- List of `vault_items` for this capsule
- Two-key unlock: Both users must enter their PIN
- Types: passwords, account numbers, documents
- All content encrypted client-side

## 5. Real-Time Subscriptions
In capsule detail view, set up Supabase Realtime:
- Subscribe to `shared_tasks` changes
- Subscribe to `capsule_messages` inserts
- Subscribe to `emotional_logs` inserts

## 6. Helper Functions (Already in Schema)
- `accept_capsule_invite(invite_code)` - Accept invitation
- `calculate_relationship_health(capsule_id)` - Returns health score

## Technical Constraints
- Use `expo-crypto` for E2EE key generation
- Partner's public key stored in `relationship_capsules.shared_key`
- All vault/message content stored as encrypted Base64
- Haptics: `NotificationAsync(Success)` when interaction logged
- Animations: Pulse ring should "breathe" slowly when healthy
```

---

## 📍 Phase 4: The Pulse Engine (Mock Data & Dashboard)

**Status**: Implement after Phase 3.5 is tested

### Copy/Paste Prompt for Agent:

```
We are building the "Morning Briefing" dashboard. Use a Service Interface with Mock Data before dealing with real APIs.

## 1. The Pulse Service (Architecture)
Create `services/pulseService.ts`:
- Simulate network latency with `setTimeout` (1-2 seconds)
- Methods:
  1. `getBioMetrics()`: Returns `{ recoveryScore: number, sleepHours: number, mood: string }`
  2. `getHomeStatus()`: Returns `{ temp: number, condition: 'Rain'|'Clear', securityStatus: string }`
  3. `getRelationshipContext()`: Returns `{ nextMeeting: { name, time }, overdueContact: string|null }`
- Randomize return values slightly

## 2. The Pulse Hook (Logic)
Create `hooks/usePulse.ts`:
- State: `isSyncing`, `data`, `error`
- Function: `triggerSync()`
  - Sets `isSyncing = true`
  - Uses `Promise.allSettled([...])` to call all service methods in parallel
  - Aggregates results
  - Haptics: `Heavy` on start, `Success` on finish

## 3. The Dashboard UI (Center View)
In `views/DashboardView.tsx`:
- Header: "Good Morning, [User Name]"
- Sync Trigger: Large "Breath" button
  - Animation: Scale up/down loop with blur when `isSyncing`
- Widgets (Grid Layout):
  - Self Card: Ring Chart for "Recovery Score" (Indigo)
  - Home Card: Weather icon + "Home is Secure" (Sage)
  - Rel Card: "Next: Dinner with [Name]" (Terracotta)
- Loading State: Skeleton loaders (shimmer effect)

## Technical Constraints
- Define shared `DashboardInterface` for type safety
- If one API fails (1 in 10 times), show "Connection Lost" but other cards work
- Use `Easing.inOut(Easing.ease)` for breathing animation
```

---

## 📍 Phase 5: The "Sanctuary" Polish

**Status**: Implement after Phase 4

### Copy/Paste Prompt for Agent:

```
The core functionality is built. Now apply the "Sanctuary" design language.

## 1. Typography & Global Styling
- Install `@expo-google-fonts/outfit`
- Apply globally via `app/_layout.tsx`
- Text Hierarchy: Light weight headers, regular body, wide letter-spacing
- No bold text - use size and color for hierarchy

## 2. The "Gatekeeper" (Biometric Privacy)
Already implemented in `providers/AuthProvider.tsx`, but verify:
- App locks after 2 minutes in background
- BlurView covers content when locked
- FaceID/TouchID triggers automatically

## 3. Organic Micro-Interactions (Haptics)
Add haptics to all actions:
- Tab Switch: `SelectionAsync`
- Task Complete: `NotificationAsync(Success)`
- Delete/Warning: `NotificationAsync(Error)`
- Pull to Refresh: `ImpactAsync(Medium)`

## 4. Visual Transitions (Reanimated)
Refine list loading:
- Items should slide up 10px and fade in (Opacity 0->1)
- Stagger by index (Item 1 = 0ms, Item 2 = 50ms, etc.)
- Use `LayoutAnimation` (Entering) from `react-native-reanimated`

## 5. Dark Mode Palette
Verify all colors match:
- Background: `#121212`
- Surface: `#1E1E1E`
- Text Primary: `#E0E0E0`
- Text Secondary: `#A0A0A0`
- Borders: `rgba(255,255,255,0.05)`
```

---

## 📍 Phase 6: Real Integrations

**Status**: Implement after Phase 5

This phase replaces mock services with real API calls:

1. Weather API (OpenWeatherMap)
2. Google Calendar
3. Apple Health / Oura Ring
4. Spotify
5. Smart home devices

Each integration should:
- Store credentials in `integrations` table (encrypted)
- Use Supabase Edge Functions for server-side API calls
- Handle failures gracefully (show cached data)
- Respect rate limits

---

## 📍 Phase 7: HomeOS (CHO Dashboard)

**Status**: Implement after Phase 6

### Copy/Paste Prompt for Agent:

```
We are building the "Chief Household Officer" Dashboard - a complete home management ERP for the Home circle.

## Background Context
The database schema exists in `supabase/schema_home.sql`. Apply it to create:
- `home_inventory`, `subscriptions`, `vendors`
- `service_logs`, `maintenance_schedules`, `home_documents`
- Functions: `search_vendors()`, `get_home_alerts()`

## 1. HomeOS Dashboard View
Update `views/HomeView.tsx`:
- Replace placeholder with full CHO Dashboard
- Layout: Card grid with 4 main sections:
  1. **Inventory** - Items with warranty tracking
  2. **Subscriptions** - Monthly/annual recurring costs
  3. **Vendors** - Service provider memory bank
  4. **Maintenance** - Upcoming scheduled tasks

## 2. Inventory Management
Create `components/home/InventorySection.tsx`:
- List of `home_inventory` items with photos
- Quick stats: Total items, expiring warranties, total value
- Sort/filter by category, location, warranty status

Create `components/home/AddInventoryModal.tsx`:
- Fields: name, category, location, purchase_date, purchase_price
- Barcode scanner: Use `expo-barcode-scanner`
- On scan: Call `enrich-inventory-item` Edge Function
- AI returns: warranty_months, manual_url, support_phone

Create `components/home/InventoryDetail.tsx`:
- Full item view with warranty timeline (progress bar)
- Link to PDF manual
- Maintenance schedule list
- "Register Warranty" button

## 3. Subscription Tracker
Create `components/home/SubscriptionSection.tsx`:
- List all subscriptions with cost/frequency
- Monthly burn rate calculation
- Sort by: cost, next billing date, category
- Color coding: Essential (green), Optional (yellow), Unused (red)

Create `components/home/AddSubscriptionModal.tsx`:
- Fields: name, cost, frequency, category, next_billing_date
- Toggle: auto_renew, is_active

Create `components/home/SubscriptionDetail.tsx`:
- Full details + cancellation instructions
- "Kill Switch" button:
  - Calls `generate-cancellation` Edge Function
  - AI generates formal cancellation letter citing consumer protection
  - Copy to clipboard or open email composer

## 4. Vendor Memory Bank
Create `components/home/VendorSection.tsx`:
- Fuzzy search bar (uses `search_vendors()` function)
- Display vendor cards with trade, rating, last service date
- "Quick Call" button

Create `components/home/AddVendorModal.tsx`:
- Fields: name, trade, phone, email, notes, rating

Create `components/home/VendorDetail.tsx`:
- Full profile + service history
- List of past `service_logs` entries
- "Log Service" button to add new entry

## 5. Maintenance Calendar
Create `components/home/MaintenanceSection.tsx`:
- List upcoming maintenance tasks
- Overdue items highlighted in red
- Group by: This Week, This Month, Upcoming

## 6. Edge Functions Required
Create two Edge Functions:

### `supabase/functions/enrich-inventory-item/index.ts`
- Input: `{ barcode?: string, name?: string, category?: string }`
- Uses OpenAI GPT-4o to lookup:
  - warranty_months (typical for this product)
  - manual_url (product manual PDF if findable)
  - support_phone (manufacturer support)
  - suggested_maintenance (maintenance schedule items)
- Returns structured JSON

### `supabase/functions/generate-cancellation/index.ts`
- Input: `{ subscription_name: string, user_name: string, account_details?: string }`
- Uses OpenAI to generate formal cancellation letter
- Cites relevant consumer protection laws (CCPA, state laws)
- Returns: `{ letter: string, subject_line: string }`

## 7. Alerts System
Use `get_home_alerts()` database function to show:
- Warranties expiring in 30 days
- Subscriptions billing soon
- Overdue maintenance items
- Display as notification badges on Home circle

## Technical Constraints
- Use `expo-barcode-scanner` for inventory scanning
- Store OpenAI API key in Supabase Secrets
- Use `pg_trgm` for fuzzy vendor search (already in schema)
- Haptics: `ImpactAsync(Heavy)` on successful scan
- Cache AI enrichment results in `ai_enrichment_data` JSONB field
```

---

## 📍 Phase 8: Advanced Features

**Status**: Future enhancements

1. **AI Relationship Mediator**: Sentiment analysis on chat logs, proactive suggestions
2. **Voice Commands**: "Hey CLO, log that I talked to Sarah"
3. **Apple Watch Companion**: Quick logging from wrist
4. **Widgets**: iOS home screen widgets for morning briefing
5. **Shared Household**: Multiple family members managing same home

---

## 🎯 Success Criteria

After each phase, test:
- [ ] All gestures work smoothly
- [ ] Animations are organic (not jerky)
- [ ] Haptic feedback feels intentional
- [ ] Dark mode is consistent
- [ ] No TypeScript errors
- [ ] RLS policies prevent data leaks
- [ ] App locks when backgrounded
- [ ] Relationship Capsule invites work end-to-end
- [ ] E2EE prevents server-side data reading
- [ ] HomeOS barcode scanning enriches items
- [ ] Vendor fuzzy search handles typos

---

## 🚨 Important Notes

1. **Never skip phases** - Each builds on the previous
2. **Test on device** - Simulator doesn't show haptics or biometrics properly
3. **Check RLS** - Always verify users can only see their own data
4. **Performance** - Use `React.memo` and `useMemo` for lists
5. **Error handling** - Every API call must have try/catch
6. **E2EE Testing** - Verify encrypted content cannot be read in Supabase dashboard
7. **Edge Functions** - Test locally with `supabase functions serve` before deploying

---

## 📞 Need Help?

Refer to:
- `agent.md` for code standards and module protocols
- `supabase/schema.sql` for base database structure
- `supabase/schema_relationships.sql` for Capsule tables
- `supabase/schema_home.sql` for HomeOS tables
- `types/database.ts` for TypeScript types
- `README.md` for overall architecture
