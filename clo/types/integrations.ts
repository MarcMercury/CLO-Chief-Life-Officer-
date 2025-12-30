/**
 * Integration Types
 * 
 * Type definitions for all third-party integrations.
 */

// ============================================
// PROVIDER TYPES
// ============================================

export type IntegrationProvider = 
  // Weather
  | 'openweathermap'
  // Calendar & Productivity
  | 'google_calendar'
  | 'apple_calendar'
  | 'outlook_calendar'
  | 'google_tasks'
  | 'todoist'
  | 'notion'
  // Health & Fitness
  | 'oura'
  | 'apple_health'
  | 'fitbit'
  | 'whoop'
  | 'garmin'
  | 'strava'
  | 'headspace'
  | 'calm'
  // Music & Media
  | 'spotify'
  | 'apple_music'
  // Smart Home
  | 'smartthings'
  | 'homekit'
  | 'google_home'
  | 'amazon_alexa'
  | 'ring'
  | 'nest'
  // Finance
  | 'plaid'
  | 'mint'
  | 'ynab'
  // Relationships & Communication
  | 'google_contacts'
  | 'apple_contacts';

export type IntegrationStatus = 'connected' | 'disconnected' | 'expired' | 'error';

// ============================================
// INTEGRATION CONFIGS
// ============================================

export interface IntegrationConfig {
  provider: IntegrationProvider;
  name: string;
  description: string;
  icon: string;
  category: 'weather' | 'calendar' | 'health' | 'music' | 'home' | 'finance' | 'contacts';
  requiresOAuth: boolean;
  scopes?: string[];
}

export const INTEGRATION_CONFIGS: Record<IntegrationProvider, IntegrationConfig> = {
  // ============ WEATHER ============
  openweathermap: {
    provider: 'openweathermap',
    name: 'OpenWeatherMap',
    description: 'Real-time weather data for your location',
    icon: '🌤️',
    category: 'weather',
    requiresOAuth: false,
  },
  
  // ============ CALENDAR & PRODUCTIVITY ============
  google_calendar: {
    provider: 'google_calendar',
    name: 'Google Calendar',
    description: 'Sync your events and meetings',
    icon: '📅',
    category: 'calendar',
    requiresOAuth: true,
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  },
  apple_calendar: {
    provider: 'apple_calendar',
    name: 'Apple Calendar',
    description: 'Sync events from iCloud Calendar',
    icon: '📆',
    category: 'calendar',
    requiresOAuth: false,
  },
  outlook_calendar: {
    provider: 'outlook_calendar',
    name: 'Outlook Calendar',
    description: 'Microsoft 365 and Outlook.com events',
    icon: '📧',
    category: 'calendar',
    requiresOAuth: true,
    scopes: ['Calendars.Read'],
  },
  google_tasks: {
    provider: 'google_tasks',
    name: 'Google Tasks',
    description: 'Sync tasks and to-dos from Google',
    icon: '✅',
    category: 'calendar',
    requiresOAuth: true,
    scopes: ['https://www.googleapis.com/auth/tasks.readonly'],
  },
  todoist: {
    provider: 'todoist',
    name: 'Todoist',
    description: 'Import tasks and projects from Todoist',
    icon: '📝',
    category: 'calendar',
    requiresOAuth: true,
    scopes: ['data:read'],
  },
  notion: {
    provider: 'notion',
    name: 'Notion',
    description: 'Connect databases and pages from Notion',
    icon: '📓',
    category: 'calendar',
    requiresOAuth: true,
  },
  
  // ============ HEALTH & FITNESS ============
  oura: {
    provider: 'oura',
    name: 'Oura Ring',
    description: 'Sleep, recovery, and activity tracking',
    icon: '💍',
    category: 'health',
    requiresOAuth: true,
    scopes: ['daily', 'heartrate', 'sleep'],
  },
  apple_health: {
    provider: 'apple_health',
    name: 'Apple Health',
    description: 'Health and fitness data from your iPhone',
    icon: '❤️',
    category: 'health',
    requiresOAuth: false,
  },
  fitbit: {
    provider: 'fitbit',
    name: 'Fitbit',
    description: 'Activity, sleep, and heart rate data',
    icon: '⌚',
    category: 'health',
    requiresOAuth: true,
    scopes: ['activity', 'heartrate', 'sleep', 'weight'],
  },
  whoop: {
    provider: 'whoop',
    name: 'WHOOP',
    description: 'Recovery, strain, and sleep performance',
    icon: '🔴',
    category: 'health',
    requiresOAuth: true,
  },
  garmin: {
    provider: 'garmin',
    name: 'Garmin Connect',
    description: 'Fitness and wellness data from Garmin devices',
    icon: '🏃',
    category: 'health',
    requiresOAuth: true,
  },
  strava: {
    provider: 'strava',
    name: 'Strava',
    description: 'Running, cycling, and workout activities',
    icon: '🚴',
    category: 'health',
    requiresOAuth: true,
    scopes: ['activity:read'],
  },
  headspace: {
    provider: 'headspace',
    name: 'Headspace',
    description: 'Meditation and mindfulness tracking',
    icon: '🧘',
    category: 'health',
    requiresOAuth: true,
  },
  calm: {
    provider: 'calm',
    name: 'Calm',
    description: 'Sleep and meditation session data',
    icon: '🌙',
    category: 'health',
    requiresOAuth: true,
  },
  
  // ============ MUSIC & MEDIA ============
  spotify: {
    provider: 'spotify',
    name: 'Spotify',
    description: 'Currently playing and mood detection',
    icon: '🎵',
    category: 'music',
    requiresOAuth: true,
    scopes: ['user-read-playback-state', 'user-read-currently-playing'],
  },
  apple_music: {
    provider: 'apple_music',
    name: 'Apple Music',
    description: 'Music playback and listening history',
    icon: '🎧',
    category: 'music',
    requiresOAuth: false,
  },
  
  // ============ SMART HOME ============
  smartthings: {
    provider: 'smartthings',
    name: 'SmartThings',
    description: 'Samsung smart home devices',
    icon: '🏠',
    category: 'home',
    requiresOAuth: true,
  },
  homekit: {
    provider: 'homekit',
    name: 'Apple HomeKit',
    description: 'Control your Apple smart home',
    icon: '🏡',
    category: 'home',
    requiresOAuth: false,
  },
  google_home: {
    provider: 'google_home',
    name: 'Google Home',
    description: 'Nest and Google smart devices',
    icon: '🔊',
    category: 'home',
    requiresOAuth: true,
  },
  amazon_alexa: {
    provider: 'amazon_alexa',
    name: 'Amazon Alexa',
    description: 'Echo devices and Alexa routines',
    icon: '🔵',
    category: 'home',
    requiresOAuth: true,
  },
  ring: {
    provider: 'ring',
    name: 'Ring',
    description: 'Doorbell and security camera alerts',
    icon: '🚪',
    category: 'home',
    requiresOAuth: true,
  },
  nest: {
    provider: 'nest',
    name: 'Nest',
    description: 'Thermostat, cameras, and smoke detectors',
    icon: '🌡️',
    category: 'home',
    requiresOAuth: true,
  },
  
  // ============ FINANCE ============
  plaid: {
    provider: 'plaid',
    name: 'Plaid',
    description: 'Connect bank accounts for spending insights',
    icon: '🏦',
    category: 'finance',
    requiresOAuth: true,
  },
  mint: {
    provider: 'mint',
    name: 'Mint',
    description: 'Import budgets and transaction categories',
    icon: '💰',
    category: 'finance',
    requiresOAuth: true,
  },
  ynab: {
    provider: 'ynab',
    name: 'YNAB',
    description: 'You Need A Budget sync for spending tracking',
    icon: '💵',
    category: 'finance',
    requiresOAuth: true,
  },
  
  // ============ CONTACTS & RELATIONSHIPS ============
  google_contacts: {
    provider: 'google_contacts',
    name: 'Google Contacts',
    description: 'Import contacts and relationship details',
    icon: '👥',
    category: 'contacts',
    requiresOAuth: true,
    scopes: ['https://www.googleapis.com/auth/contacts.readonly'],
  },
  apple_contacts: {
    provider: 'apple_contacts',
    name: 'Apple Contacts',
    description: 'Sync contacts from iCloud',
    icon: '📱',
    category: 'contacts',
    requiresOAuth: false,
  },
};

// ============================================
// STORED INTEGRATION
// ============================================

export interface StoredIntegration {
  id: string;
  user_id: string;
  provider: IntegrationProvider;
  access_token_encrypted: string | null;
  refresh_token_encrypted: string | null;
  token_expires_at: string | null;
  api_key_encrypted: string | null;
  is_active: boolean;
  last_synced_at: string | null;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  condition: 'Clear' | 'Cloudy' | 'Rain' | 'Snow' | 'Thunderstorm' | 'Mist' | 'Drizzle';
  icon: string;
  description: string;
  location: string;
  sunrise: string;
  sunset: string;
  windSpeed: number;
  visibility: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  location: string | null;
  attendees: string[];
  isAllDay: boolean;
  calendarName: string;
}

export interface HealthData {
  recoveryScore: number;
  sleepHours: number;
  sleepQuality: 'excellent' | 'good' | 'fair' | 'poor';
  heartRateResting: number;
  heartRateVariability: number;
  stepsToday: number;
  activeCalories: number;
  readinessScore: number;
}

export interface SpotifyData {
  isPlaying: boolean;
  track: string | null;
  artist: string | null;
  album: string | null;
  albumArt: string | null;
  progressMs: number | null;
  durationMs: number | null;
}

export interface SmartHomeDevice {
  id: string;
  name: string;
  type: 'thermostat' | 'lock' | 'light' | 'camera' | 'sensor' | 'switch';
  status: 'online' | 'offline';
  state: Record<string, any>;
}

export interface SmartHomeData {
  securityStatus: 'armed' | 'disarmed' | 'alert';
  devices: SmartHomeDevice[];
  temperature: number | null;
  humidity: number | null;
}

// ============================================
// SERVICE RESULT TYPE
// ============================================

export interface IntegrationResult<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  cached: boolean;
  cachedAt: string | null;
}
