# CLO - Chief Life Officer

> You have 50 apps to manage your life. You only need one to understand it.

A **private, inward-looking Life Operating System** designed to harmonize three pillars of existence: **Self**, **Relationships**, and **Home**.

---

## 📱 App Overview

CLO is a React Native (Expo) mobile application that helps you manage all aspects of your life in one unified sanctuary. It's completely private—no social features, no data sharing.

### The Three Circles

| Circle | Description | Key Features |
|--------|-------------|--------------|
| 🧘 **Self** | Personal growth & wellness | Vibe Check, Burn Box, Gratitude, Daily Intentions, Focus Timer, Reading/Learning Lists |
| 💑 **Relationships** | Connection with important people | Capsules (relationship profiles), Pulse Check-ins, Shared Vaults, Decision Tools |
| 🏠 **Home** | Household management | Inventory Tracking, Subscriptions, Vendors, Maintenance Schedules, Property Management |

### Dashboard (The Pulse)

The central hub syncs data from all three circles, providing:
- **Daily Agenda** - Unified view of today's tasks and events
- **Sticky Notes** - Quick capture for thoughts and ideas
- **Bio Metrics** - Health data summary (when integrated)
- **Weather** - Current conditions for your location
- **Relationship Context** - Upcoming anniversaries, birthdays

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli` (for builds)

### Installation

```bash
# Navigate to the app directory
cd clo

# Install dependencies
npm install

# Start the development server
npm start
```

### Running on Device

```bash
npm run ios       # iOS Simulator (Mac only)
npm run android   # Android Emulator
npm run web       # Web browser
```

### Environment Variables

Create a `.env` file in the `clo/` directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_client_id
```

---

## 📁 Project Structure

```
clo/
├── app/                          # Expo Router - Screen Definitions
│   ├── _layout.tsx              # Root layout with providers
│   ├── index.tsx                # Auth gate (entry point)
│   ├── auth/
│   │   └── callback.tsx         # OAuth callback handler
│   └── (main)/                  # Protected routes (require auth)
│       ├── _layout.tsx          # Main layout with orbital navigation
│       ├── index.tsx            # Main screen (renders active view)
│       ├── capsule/
│       │   └── [id].tsx         # Individual relationship capsule
│       └── settings/
│           ├── index.tsx        # Settings screen
│           └── integrations.tsx # Integration management
│
├── views/                        # Main View Components
│   ├── DashboardView.tsx        # The Pulse - Central hub
│   ├── SelfView.tsx             # Self circle view
│   ├── RelationshipsView.tsx    # Relationships circle view
│   ├── HomeView.tsx             # Home circle view
│   └── index.ts                 # Export barrel
│
├── components/                   # Reusable UI Components
│   ├── auth/                    # Authentication UI
│   │   ├── LoginScreen.tsx      # Email/Google sign-in
│   │   └── LockScreen.tsx       # Biometric lock screen
│   │
│   ├── dashboard/               # Dashboard-specific components
│   │   ├── DailyAgenda.tsx      # Unified agenda view
│   │   └── StickyNotes.tsx      # Quick notes grid
│   │
│   ├── self/                    # Self circle components
│   │   ├── EmotionalModule.tsx  # Vibe Check, Burn Box, Gratitude tabs
│   │   ├── VibeCheck.tsx        # Russell's Circumplex emotion picker
│   │   ├── BurnBox.tsx          # Write and burn negative thoughts
│   │   ├── DailyIntentions.tsx  # Daily goal setting
│   │   ├── MentalModule.tsx     # Reading list, learning, time boxing
│   │   ├── PhysicalModule.tsx   # Health tracking
│   │   ├── PracticalModule.tsx  # Tasks and lists
│   │   ├── ProfessionalModule.tsx # Career and ideas
│   │   ├── FocusTimer.tsx       # Pomodoro-style timer
│   │   ├── TimeBox.tsx          # Time boxing feature
│   │   └── ProgressRing.tsx     # Animated progress indicator
│   │
│   ├── relationships/           # Relationship circle components
│   │   ├── CapsuleView.tsx      # Full relationship profile
│   │   ├── CapsuleCard.tsx      # Relationship preview card
│   │   ├── CapsulePulse.tsx     # Relationship health indicator
│   │   ├── CapsuleChat.tsx      # Signal chat interface
│   │   ├── CapsuleVault.tsx     # Shared memories/docs
│   │   ├── CapsulePlan.tsx      # Shared planning
│   │   ├── PulseCheckIn.tsx     # Relationship check-in modal
│   │   ├── DecideModule.tsx     # Joint decision making
│   │   ├── ResolveModule.tsx    # Conflict resolution
│   │   └── InvitePartnerModal.tsx # Partner invitation
│   │
│   ├── home/                    # Home circle components
│   │   ├── InventorySection.tsx # Home inventory management
│   │   ├── SubscriptionSection.tsx # Subscription tracking
│   │   ├── VendorSection.tsx    # Service provider directory
│   │   ├── MaintenanceSection.tsx # Maintenance scheduling
│   │   ├── PropertyPicker.tsx   # Multi-property selection
│   │   ├── AddInventoryModal.tsx # Add/edit inventory items
│   │   ├── AddSubscriptionModal.tsx # Add/edit subscriptions
│   │   ├── AddVendorModal.tsx   # Add/edit vendors
│   │   └── AddWikiModal.tsx     # Add/edit wiki entries
│   │
│   ├── navigation/              # Navigation components
│   │   └── OrbitalControl.tsx   # Gesture-based circle navigation
│   │
│   ├── modals/                  # Shared modal components
│   │   ├── CreateItemModal.tsx  # Universal item creation
│   │   └── NoteDetailModal.tsx  # Note viewing/editing
│   │
│   ├── shared/                  # Shared utility components
│   │   ├── ItemCard.tsx         # Universal item card
│   │   ├── SectionHeader.tsx    # Section headers
│   │   └── QuickAction.tsx      # Quick action buttons
│   │
│   ├── ui/                      # Base UI primitives
│   │   ├── Text.tsx             # Typography components
│   │   └── AnimatedListItem.tsx # Animated list items
│   │
│   └── settings/                # Settings components
│       └── IntegrationCard.tsx  # Integration toggle cards
│
├── hooks/                        # Custom React Hooks
│   ├── useItems.ts              # Universal item CRUD operations
│   ├── useSelf.ts               # Self circle data (moods, gratitude, books)
│   ├── useCapsules.ts           # Relationships list management
│   ├── useCapsule.ts            # Single relationship operations
│   ├── useHomeOS.ts             # Home inventory/subscriptions
│   ├── usePulse.ts              # Dashboard sync and data aggregation
│   ├── useDailyFlow.ts          # Daily agenda data
│   └── useIntegrations.ts       # External service integrations
│
├── services/                     # API and Business Logic
│   ├── selfService.ts           # Self circle database operations
│   ├── homeosService.ts         # Home circle database operations
│   ├── pulseService.ts          # Dashboard data aggregation
│   ├── enhancedPulseService.ts  # Real-time pulse updates
│   ├── integrationService.ts    # External API integrations
│   └── healthService.ts         # Health data services
│
├── providers/                    # React Context Providers
│   ├── AuthProvider.tsx         # Authentication state & biometrics
│   └── ThemeProvider.tsx        # Theme/color management
│
├── store/                        # Zustand State Stores
│   ├── uiStore.ts               # UI state (active circle, modals)
│   └── propertyStore.ts         # Selected property state
│
├── lib/                          # Core Utilities
│   ├── supabase.ts              # Supabase client initialization
│   ├── homeosSupabase.ts        # Home-specific Supabase client
│   ├── haptics.ts               # Haptic feedback helpers
│   └── formatters.ts            # Date/currency formatters
│
├── types/                        # TypeScript Definitions
│   ├── database.ts              # Core database types
│   ├── homeos.ts                # Home circle types
│   ├── relationships.ts         # Relationship types
│   └── integrations.ts          # Integration types
│
├── constants/                    # App Constants
│   └── theme.ts                 # Colors, spacing, typography
│
├── supabase/                     # Database & Backend
│   ├── schema.sql               # Main database schema
│   ├── schema_relationships.sql # Relationships tables
│   ├── schema_home.sql          # Home circle tables
│   ├── migrations/              # Database migrations
│   └── functions/               # Edge Functions
│       ├── get-weather/         # Weather data
│       ├── get-calendar/        # Calendar sync
│       ├── get-health/          # Health data
│       ├── send-invite-email/   # Email invitations
│       ├── enrich-inventory-item/ # AI item enrichment
│       └── generate-cancellation/ # Subscription cancellation
│
├── assets/                       # Static Assets
│   └── store/                   # App store assets
│
└── Configuration Files
    ├── app.json                 # Expo configuration
    ├── eas.json                 # EAS Build configuration
    ├── package.json             # Dependencies
    ├── tsconfig.json            # TypeScript configuration
    ├── tailwind.config.js       # Tailwind/NativeWind config
    ├── metro.config.js          # Metro bundler config
    └── babel.config.js          # Babel configuration
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| [Expo](https://expo.dev/) v54 | React Native framework |
| [React Native](https://reactnative.dev/) | Cross-platform mobile UI |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [Expo Router](https://expo.github.io/router/) | File-based navigation |
| [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) | Performant animations |
| [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) | Touch gesture support |
| [NativeWind](https://www.nativewind.dev/) | Tailwind CSS for React Native |

### State Management
| Technology | Purpose |
|------------|---------|
| [Zustand](https://zustand-demo.pmnd.rs/) | Global UI state |
| [TanStack Query](https://tanstack.com/query) | Server state & caching |

### Backend
| Technology | Purpose |
|------------|---------|
| [Supabase](https://supabase.com/) | PostgreSQL database + Auth |
| Supabase Edge Functions | Serverless API endpoints |
| Row Level Security (RLS) | Database-level authorization |

### Key Libraries
| Library | Purpose |
|---------|---------|
| `expo-haptics` | Haptic feedback |
| `expo-local-authentication` | Biometric auth |
| `expo-blur` | Blur effects |
| `@react-native-community/slider` | Slider inputs |
| `react-native-svg` | SVG rendering |

---

## 🔐 Security Features

- **Row Level Security (RLS)** - All database tables protected
- **Biometric Authentication** - Face ID / Touch ID lock screen
- **Auto-lock** - Automatic lock after 2 minutes in background
- **No Social Features** - Completely private, no data sharing
- **Encrypted Storage** - Secure token and credential storage

---

## 🎨 Design Philosophy

### The "Sanctuary" Vibe
- Dark mode by default (easy on the eyes)
- Organic, slow animations (500ms+ transitions)
- Muted, intentional color palette
- No aggressive typography
- Haptic feedback on all interactions

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#121212` | Deep charcoal base |
| Surface | `#1E1E1E` | Cards and elevated surfaces |
| Self Accent | `#6366f1` | Indigo - personal growth |
| Relationships Accent | `#e17055` | Terracotta - warmth |
| Home Accent | `#84a98c` | Sage - grounding |

---

## 🗄️ Database Setup

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to SQL Editor
3. Run the migration files in order:
   - `supabase/schema.sql` (core tables)
   - `supabase/schema_relationships.sql` (relationships)
   - `supabase/schema_home.sql` (home management)

---

## 📋 Feature Highlights

### 🧘 Self Circle
- **Vibe Check** - Russell's Circumplex Model for emotion tracking
- **Burn Box** - Write negative thoughts, then "burn" them away
- **Daily Intentions** - Set 3 daily goals with progress tracking
- **Gratitude Log** - Daily gratitude journaling
- **Focus Timer** - Pomodoro-style productivity sessions
- **Reading/Learning Lists** - Track books and skills

### 💑 Relationships Circle
- **Capsules** - Individual profiles for important people
- **Pulse Check-ins** - Regular relationship health assessments
- **Shared Vault** - Store memories, documents, and notes
- **Decision Tools** - Joint decision-making features
- **Signal Chat** - Private messaging within the app

### 🏠 Home Circle
- **Inventory Tracking** - Catalog household items with warranties
- **Subscription Management** - Track all subscriptions with "Kill Switch"
- **Vendor Directory** - Store contractor and service provider info
- **Maintenance Schedules** - Track home maintenance tasks
- **Multi-Property Support** - Manage multiple homes

### 📊 Dashboard (The Pulse)
- **Unified Agenda** - All tasks/events across circles
- **Sticky Notes** - Quick capture for ideas
- **Health Metrics** - Synced bio data (when integrated)
- **Weather Widget** - Current conditions
- **One-tap Sync** - Refresh all data sources

---

## 🤝 Contributing

This is a private project. See `agent.md` for AI assistant guidelines.

---

## 📄 License

Private - Not for public distribution

---

## 🙏 Philosophy

> CLO is not a social network. It's a sanctuary for your life data.

Everything is private, inward-looking, and designed to reduce cognitive load by harmonizing the three circles of existence: **Self**, **Relationships**, and **Home**.
