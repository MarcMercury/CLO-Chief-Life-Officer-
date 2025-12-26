# CLO - Chief Life Officer

A private, inward-looking Life Operating System designed to harmonize three pillars of existence: Self, Relationships, and Home.

## 🎯 Project Status

**Phase 1: Authentication & Foundation** ✅ **COMPLETE**

The core infrastructure is now in place:
- ✅ Expo + React Native project initialized
- ✅ Supabase backend configured
- ✅ TypeScript strict mode enabled
- ✅ Database schema created
- ✅ Authentication system built (Email + Google OAuth)
- ✅ Biometric lock screen implemented
- ✅ State management (Zustand) set up
- ✅ Query client (TanStack Query) configured

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)

### Installation

```bash
cd clo
npm install
```

### Environment Setup

Create a `.env` file in the `clo/` directory (already created):

```env
EXPO_PUBLIC_SUPABASE_URL=https://tfjshcmchznxqsylvilp.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_CdvcbOSMmtCoFTxP3y-9Xw_ICcO7OQH
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=956096534432-j6sgm2n7n7vdfc7n0bs650bp9no19o11.apps.googleusercontent.com
```

### Running the App

```bash
# Start Expo
npm start

# Run on specific platform
npm run ios       # iOS (requires Mac)
npm run android   # Android
npm run web       # Web browser
```

## 🗄️ Database Setup

Run the SQL migration in your Supabase dashboard:

1. Go to https://tfjshcmchznxqsylvilp.supabase.co
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Execute the migration

This will create:
- User profiles table
- Universal items table
- Item circles (junction table)
- Relationships table
- Integrations table
- All necessary RLS policies

## 📁 Project Structure

```
clo/
├── app/                    # Expo Router screens
│   ├── (main)/            # Protected main app routes
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry point
├── components/            # Reusable UI components
│   └── auth/              # Authentication screens
├── hooks/                 # Custom React hooks
├── lib/                   # Core libraries
│   └── supabase.ts        # Supabase client
├── providers/             # React context providers
│   └── AuthProvider.tsx   # Authentication provider
├── services/              # API and external services
├── store/                 # Zustand state management
│   └── uiStore.ts         # UI state
├── supabase/              # Database schemas
├── types/                 # TypeScript definitions
│   └── database.ts        # Database types
└── views/                 # Main view components
```

## 🎨 Design Philosophy

**The "Sanctuary" Vibe**
- Dark mode by default
- Organic animations (500ms+ transitions)
- Muted, intentional color palette
- No aggressive typography
- Haptic feedback for all interactions

**Color Palette**
- Background: `#121212` (Deep Charcoal)
- Surface: `#1E1E1E`
- Self Accent: `#6366f1` (Indigo)
- Relationships Accent: `#e17055` (Terracotta)
- Home Accent: `#84a98c` (Sage)

## 🔐 Security Features

- Row Level Security (RLS) on all database tables
- Biometric authentication (Face ID / Touch ID)
- Auto-lock after 2 minutes of inactivity
- Encrypted token storage for integrations
- No social features - completely private

## 📋 Development Roadmap

### Phase 2: Orbital Navigation (Next)
- [ ] Build gesture-based navigation system
- [ ] Implement circle-based theming
- [ ] Create smooth cross-fade transitions
- [ ] Add placeholder screens for Self/Relationships/Home

### Phase 3: Universal Item System
- [ ] Create ItemCard component
- [ ] Build CreateItemModal
- [ ] Connect to Supabase
- [ ] Implement TanStack Query hooks
- [ ] Add optimistic updates

### Phase 4: The Pulse Engine
- [ ] Create mock service layer
- [ ] Build dashboard view
- [ ] Implement sync animations
- [ ] Add skeleton loaders

### Phase 5: Sanctuary Polish
- [ ] Install custom fonts
- [ ] Refine micro-interactions
- [ ] Add haptic feedback patterns
- [ ] Implement all animations

### Phase 6: Real Integrations
- [ ] Weather API
- [ ] Google Calendar
- [ ] Apple Health / Oura
- [ ] Spotify
- [ ] Smart home devices

## 🛠️ Tech Stack

- **Frontend**: Expo (React Native) + TypeScript
- **Routing**: Expo Router
- **State**: Zustand + TanStack Query
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Styling**: NativeWind (Tailwind CSS for RN)
- **Animations**: React Native Reanimated
- **Gestures**: React Native Gesture Handler

## 📖 Agent Instructions

The `agent.md` file in the root contains behavioral protocols for AI coding assistants. Read this file to understand:
- Code standards (TypeScript strict mode, no `any` types)
- Security checkpoints
- The "Venn" data logic
- Performance requirements

## 🔑 Credentials Reference

**Supabase**
- Project URL: `https://tfjshcmchznxqsylvilp.supabase.co`
- Database Password: `KuOMJv1JsppmnF3p`

**Google Cloud (OAuth)**
- Project: Chief Life Officer
- Client ID: `956096534432-j6sgm2n7n7vdfc7n0bs650bp9no19o11.apps.googleusercontent.com`

**Expo**
- Project ID: `134e7861-725f-4076-b1dd-3b374c7cf69f`

## 📄 License

Private - Not for public distribution

## 🙏 Philosophy

CLO is not a social network. It's a sanctuary for your life data. Everything is private, inward-looking, and designed to reduce cognitive load by harmonizing the three circles of existence: Self, Relationships, and Home.
