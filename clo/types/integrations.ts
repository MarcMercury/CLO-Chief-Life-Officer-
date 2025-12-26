/**
 * Integration Types
 * 
 * Type definitions for all third-party integrations.
 */

// ============================================
// PROVIDER TYPES
// ============================================

export type IntegrationProvider = 
  | 'openweathermap'
  | 'google_calendar'
  | 'oura'
  | 'apple_health'
  | 'spotify'
  | 'smartthings'
  | 'homekit';

export type IntegrationStatus = 'connected' | 'disconnected' | 'expired' | 'error';

// ============================================
// INTEGRATION CONFIGS
// ============================================

export interface IntegrationConfig {
  provider: IntegrationProvider;
  name: string;
  description: string;
  icon: string;
  category: 'weather' | 'calendar' | 'health' | 'music' | 'home';
  requiresOAuth: boolean;
  scopes?: string[];
}

export const INTEGRATION_CONFIGS: Record<IntegrationProvider, IntegrationConfig> = {
  openweathermap: {
    provider: 'openweathermap',
    name: 'OpenWeatherMap',
    description: 'Real-time weather data for your location',
    icon: '🌤️',
    category: 'weather',
    requiresOAuth: false,
  },
  google_calendar: {
    provider: 'google_calendar',
    name: 'Google Calendar',
    description: 'Sync your events and meetings',
    icon: '📅',
    category: 'calendar',
    requiresOAuth: true,
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  },
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
  spotify: {
    provider: 'spotify',
    name: 'Spotify',
    description: 'Currently playing and mood detection',
    icon: '🎵',
    category: 'music',
    requiresOAuth: true,
    scopes: ['user-read-playback-state', 'user-read-currently-playing'],
  },
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
