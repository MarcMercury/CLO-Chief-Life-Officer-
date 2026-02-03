/**
 * CLO Custom Icon System
 * 
 * Artistic icons with orbital elements, constellation-like connections,
 * and distinctive silhouettes. Consistent style across all app sections.
 */

// Self Section Icons
export { default as Daily3Icon } from './self/Daily3Icon';
export { default as MindIcon } from './self/MindIcon';
export { default as BodyIcon } from './self/BodyIcon';
export { default as SoulIcon } from './self/SoulIcon';
// Legacy icons (kept for backwards compatibility)
export { default as MentalIcon } from './self/MentalIcon';
export { default as PhysicalIcon } from './self/PhysicalIcon';
export { default as EmotionalIcon } from './self/EmotionalIcon';
export { default as PracticalIcon } from './self/PracticalIcon';
export { default as ProfessionalIcon } from './self/ProfessionalIcon';

// Home Section Icons
export { default as OverviewIcon } from './home/OverviewIcon';
export { default as InventoryIcon } from './home/InventoryIcon';
export { default as BillsIcon } from './home/BillsIcon';
export { default as VendorsIcon } from './home/VendorsIcon';
export { default as ManualIcon } from './home/ManualIcon';
export { default as AlertsIcon } from './home/AlertsIcon';

// Relationship Section Icons
export { default as PulseIcon } from './relationship/PulseIcon';
export { default as PlanIcon } from './relationship/PlanIcon';
export { default as DecideIcon } from './relationship/DecideIcon';
export { default as ResolveIcon } from './relationship/ResolveIcon';
export { default as VaultIcon } from './relationship/VaultIcon';
export { default as SignalIcon } from './relationship/SignalIcon';

// Navigation Icons
export { default as NestIcon } from './nav/NestIcon';
export { default as SelfNavIcon } from './nav/SelfNavIcon';
export { default as HomeNavIcon } from './nav/HomeNavIcon';
export { default as RelationshipNavIcon } from './nav/RelationshipNavIcon';

// Icon Props Type
export interface IconProps {
  size?: number;
  color?: string;
  secondaryColor?: string;
  glowColor?: string;
  strokeWidth?: number;
}

export const DEFAULT_ICON_SIZE = 48;
export const DEFAULT_STROKE_WIDTH = 1.5;
