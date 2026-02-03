# ADR-001: Application Architecture

## Status

Accepted

## Date

2026-01-29

## Context

CLO needs a scalable, maintainable architecture that:
- Supports React Native mobile development
- Enables rapid iteration
- Maintains clear separation of concerns
- Supports offline-first capabilities (future)
- Handles real-time data synchronization

## Decision

We adopt a layered architecture with the following structure:

### Layers (outer to inner)

```
┌─────────────────────────────────────┐
│            App Layer                │
│    (Expo Router - Navigation)       │
├─────────────────────────────────────┤
│           View Layer                │
│   (Screen compositions - Views)     │
├─────────────────────────────────────┤
│         Component Layer             │
│    (Reusable UI components)         │
├─────────────────────────────────────┤
│           Hook Layer                │
│  (Data fetching, business logic)    │
├─────────────────────────────────────┤
│          Service Layer              │
│  (API calls, external integrations) │
├─────────────────────────────────────┤
│           Data Layer                │
│ (Supabase client, local storage)    │
└─────────────────────────────────────┘
```

### State Management Strategy

1. **Server State**: TanStack Query
   - Caching
   - Refetching
   - Optimistic updates
   - Request deduplication

2. **UI State**: Zustand
   - Navigation state (active circle)
   - Modal visibility
   - User preferences

3. **Auth State**: React Context
   - User session
   - Biometric status

### Data Flow

```
User Action → Component → Hook → Service → Supabase
                                    ↓
                              Edge Function (if needed)
                                    ↓
                              External API
```

## Consequences

### Positive
- Clear separation makes code easy to find
- Components are reusable across views
- Hooks can be tested independently
- Services are mockable for testing
- Easy to add new features without touching core

### Negative
- More files to navigate
- Some boilerplate for simple features
- Learning curve for new developers

### Neutral
- Need to decide which layer handles each concern
- Some features span multiple layers

## Alternatives Considered

### Alternative 1: Redux + Redux Saga
- More boilerplate
- More powerful side effect management
- Larger bundle size
- **Why not chosen**: Overkill for this app's needs; TanStack Query + Zustand is simpler

### Alternative 2: MobX
- Simpler reactive state
- Less boilerplate
- **Why not chosen**: Less ecosystem support; Zustand is lighter and sufficient

### Alternative 3: Monolithic Components
- Faster initial development
- Less abstraction
- **Why not chosen**: Not maintainable at scale; testing is difficult

## Related Decisions

- ADR-002 (future): Database schema design
- ADR-003 (future): Real-time subscription strategy
- ADR-004 (future): Offline-first implementation

## Notes

This architecture should be reviewed quarterly as the app evolves. If we find the boundaries aren't working, we should update this ADR and adjust the structure.
