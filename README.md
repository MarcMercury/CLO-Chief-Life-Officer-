# CLO - Chief Life Officer

> You have 50 apps to manage your life. You only need one to understand it.

A **private, inward-looking Life Operating System** that harmonizes three pillars of existence: **Self**, **Relationships**, and **Home**.

---

## 🎯 Project Status: Production Ready

All core features are implemented and functional:

| Circle | Status | Features |
|--------|--------|----------|
| 📊 **Dashboard** | ✅ Complete | Daily Agenda, Sticky Notes, Pulse Sync, Widgets |
| 🧘 **Self** | ✅ Complete | Vibe Check, Burn Box, Gratitude, Lists, Focus Timer |
| 💑 **Relationships** | ✅ Complete | Capsules, Pulse Check-ins, Vault, Chat |
| 🏠 **Home** | ✅ Complete | Inventory, Subscriptions, Vendors, Maintenance |

---

## 🚀 Quick Start

```bash
# Navigate to app directory
cd clo

# Install dependencies
npm install

# Start development server
npm start

# Run on platform
npm run ios      # iOS (Mac only)
npm run android  # Android
npm run web      # Web browser
```

### Environment Setup

Create `clo/.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_client_id
```

### Database Setup

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor  
3. Run migrations in order:
   - `clo/supabase/schema.sql`
   - `clo/supabase/schema_relationships.sql`
   - `clo/supabase/schema_home.sql`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Expo (React Native) + TypeScript |
| **Navigation** | Expo Router (file-based) |
| **State** | Zustand + TanStack Query |
| **Backend** | Supabase (PostgreSQL + Auth + Edge Functions) |
| **Styling** | NativeWind (Tailwind CSS for RN) |
| **Animations** | React Native Reanimated |
| **Gestures** | React Native Gesture Handler |

---

## 📁 Project Structure

```
clo/
├── app/              # Expo Router screens
├── views/            # Main view components (Dashboard, Self, Relationships, Home)
├── components/       # Reusable UI components by feature
├── hooks/            # Custom React hooks (data fetching, state)
├── services/         # API and business logic
├── providers/        # React context providers
├── store/            # Zustand state stores
├── lib/              # Core utilities (supabase, haptics)
├── types/            # TypeScript definitions
├── constants/        # App constants (theme, colors)
└── supabase/         # Database schemas and edge functions
```

**📖 See [clo/README.md](clo/README.md) for complete structure documentation.**

---

## 🎨 Design Philosophy

### The "Sanctuary" Approach
- **Dark mode** by default - easy on the eyes
- **Organic animations** - 500ms+ transitions that feel natural
- **Haptic feedback** - every interaction has tactile response
- **Privacy-first** - no social features, no data sharing

### Color Palette
| Circle | Color | Hex |
|--------|-------|-----|
| Self | Indigo | `#6366f1` |
| Relationships | Terracotta | `#e17055` |
| Home | Sage | `#84a98c` |
| Background | Charcoal | `#121212` |

---

## 🔐 Security

- **Row Level Security (RLS)** on all tables
- **Biometric lock** (Face ID / Touch ID)
- **Auto-lock** after 2 minutes in background
- **No social features** - completely private

---

## 📋 Key Features

### Dashboard (The Pulse)
- Unified daily agenda across all circles
- Sticky notes for quick capture
- Weather and health widgets
- One-tap sync to refresh all data

### Self Circle
- **Vibe Check** - Track emotions using Russell's Circumplex Model
- **Burn Box** - Write and "burn" negative thoughts
- **Gratitude** - Daily gratitude journaling
- **Focus Timer** - Pomodoro-style productivity
- **Reading/Learning Lists** - Track books and skills

### Relationships Circle
- **Capsules** - Individual profiles for important people
- **Pulse Check-ins** - Regular relationship health assessments
- **Vault** - Shared memories and documents
- **Signal Chat** - Private messaging

### Home Circle
- **Inventory** - Track items with warranties
- **Subscriptions** - Manage with "Kill Switch" cancellation
- **Vendors** - Directory of service providers
- **Maintenance** - Track home maintenance schedules
- **Multi-property** - Support for multiple homes

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [clo/README.md](clo/README.md) | Complete project documentation |
| [agent.md](agent.md) | AI assistant behavioral protocols |
| [clo/DEVELOPMENT_PHASES.md](clo/DEVELOPMENT_PHASES.md) | Phase-by-phase build guide |
| [clo/QUICK_START.md](clo/QUICK_START.md) | How to run and test |

---

## 🙏 Philosophy

> CLO is not a social network. It's a sanctuary for your life data.

Everything is private, inward-looking, and designed to reduce cognitive load by harmonizing the three circles of existence: **Self**, **Relationships**, and **Home**.

---

## 📄 License

Private - Not for public distribution.

---

**Built with intention. Designed for calm. Your Life OS awaits.** 🌱
