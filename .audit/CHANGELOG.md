# Changelog

All notable changes to the CLO project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- `.credentials/` folder with organized credential templates and documentation
- `.audit/` folder for tracking code quality, tech debt, and decisions
- Enhanced `agent.md` with auto-learning and pre/post implementation protocols
- Comprehensive ADR (Architecture Decision Record) system

### Changed
- Improved documentation structure across the project

---

## [1.0.0] - 2026-01-29

### Added
- **Core Application**
  - Expo + React Native + TypeScript foundation
  - Expo Router file-based navigation
  - NativeWind (Tailwind CSS) styling system
  - React Native Reanimated animations
  - React Native Gesture Handler

- **Authentication System**
  - Email/password authentication via Supabase
  - Google OAuth integration
  - Biometric lock screen (Face ID / Touch ID)
  - Auto-lock after 2 minutes inactivity
  - Session persistence

- **Database Architecture**
  - Complete PostgreSQL schema on Supabase
  - `profiles` table for user data
  - `items` table (universal tasks/notes/events/memories)
  - `item_circles` junction table for multi-circle items
  - `relationship_capsules` for two-person spaces
  - `home_*` tables for household management
  - Row Level Security (RLS) on all tables

- **Navigation System**
  - Orbital Control gesture-based navigation
  - Four circles: Dashboard, Self, Relationships, Home
  - Dynamic theme colors per circle
  - Cross-fade view transitions

- **Self Circle**
  - Vibe Check (emotional tracking)
  - Burn Box (cathartic writing)
  - Gratitude journaling
  - Focus Timer (Pomodoro)
  - Reading/Learning lists

- **Relationships Circle**
  - Capsule system for individual relationships
  - Pulse check-ins (relationship health)
  - Vault (shared secure storage)
  - Chat with AI mediator option
  - Invite flow with magic links

- **Home Circle (HomeOS)**
  - Property management (multi-property support)
  - Inventory tracking with warranties
  - Subscription management with "Kill Switch"
  - Vendor directory
  - Maintenance scheduling

- **Dashboard**
  - Daily agenda aggregation
  - Sticky notes for quick capture
  - Weather widget
  - Health metrics integration
  - One-tap sync for all data

- **Edge Functions**
  - `enrich-inventory-item`: AI product lookup
  - `generate-cancellation`: AI cancellation letters
  - `get-calendar`: Calendar integration
  - `get-health`: Health data aggregation
  - `get-weather`: Weather API
  - `send-invite-email`: Capsule invitations

- **State Management**
  - Zustand for UI state
  - TanStack Query for server state
  - Optimistic updates for mutations
  - Proper cache invalidation

### Security
- RLS policies on all database tables
- Service role key restricted to Edge Functions
- Biometric authentication required
- E2EE ready for Vault and Chat

---

## Version History

| Version | Date | Summary |
|---------|------|---------|
| 1.0.0 | 2026-01-29 | Initial production release |

---

## Migration Notes

### From 0.x to 1.0.0
- Run all database migrations in order
- Update environment variables for new structure
- Clear app data and re-authenticate

---

## Contributors
- Initial development by project team
- AI-assisted development with comprehensive protocols
