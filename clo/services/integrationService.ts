/**
 * Integration Service
 * 
 * Client-side service for managing integrations and calling Edge Functions.
 * Provides a unified interface for all third-party API calls.
 */

import { supabase } from '@/lib/supabase';
import { 
  IntegrationProvider, 
  StoredIntegration,
  WeatherData,
  CalendarEvent,
  HealthData,
  IntegrationResult,
  INTEGRATION_CONFIGS,
} from '@/types/integrations';
import * as Location from 'expo-location';

// ============================================
// INTEGRATION MANAGEMENT
// ============================================

/**
 * Get all integrations for the current user
 */
export async function getIntegrations(): Promise<StoredIntegration[]> {
  // Using 'any' cast since integrations table may not be in generated types yet
  const { data, error } = await (supabase as any)
    .from('integrations')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Failed to fetch integrations:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get a specific integration by provider
 */
export async function getIntegration(provider: IntegrationProvider): Promise<StoredIntegration | null> {
  const { data, error } = await (supabase as any)
    .from('integrations')
    .select('*')
    .eq('provider', provider)
    .single();
  
  if (error) {
    if (error.code !== 'PGRST116') { // Not found is ok
      console.error('Failed to fetch integration:', error);
    }
    return null;
  }
  
  return data;
}

/**
 * Add or update an integration with an API key
 */
export async function saveApiKeyIntegration(
  provider: IntegrationProvider,
  apiKey: string,
  config: Record<string, any> = {}
): Promise<{ success: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  // Using 'any' cast since integrations table may not be in generated types yet
  const { error } = await (supabase as any)
    .from('integrations')
    .upsert({
      user_id: user.id,
      provider,
      api_key_encrypted: apiKey,
      is_active: true,
      config,
    }, {
      onConflict: 'user_id,provider'
    });

  if (error) {
    console.error('Failed to save integration:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Disconnect an integration
 */
export async function disconnectIntegration(
  provider: IntegrationProvider
): Promise<{ success: boolean; error?: string }> {
  const { error } = await (supabase as any)
    .from('integrations')
    .update({ is_active: false })
    .eq('provider', provider);

  if (error) {
    console.error('Failed to disconnect integration:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Delete an integration completely
 */
export async function deleteIntegration(
  provider: IntegrationProvider
): Promise<{ success: boolean; error?: string }> {
  const { error } = await (supabase as any)
    .from('integrations')
    .delete()
    .eq('provider', provider);

  if (error) {
    console.error('Failed to delete integration:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================
// DATA FETCHING
// ============================================

/**
 * Get current weather data
 */
export async function fetchWeather(
  lat?: number,
  lon?: number
): Promise<IntegrationResult<WeatherData>> {
  try {
    // Get location if not provided
    if (!lat || !lon) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        lat = location.coords.latitude;
        lon = location.coords.longitude;
      } else {
        // Default to NYC if no location permission
        lat = 40.7128;
        lon = -74.0060;
      }
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, data: null, error: 'Not authenticated', cached: false, cachedAt: null };
    }

    const response = await supabase.functions.invoke('get-weather', {
      body: { lat, lon, units: 'imperial' },
    });

    if (response.error) {
      return { 
        success: false, 
        data: null, 
        error: response.error.message, 
        cached: false, 
        cachedAt: null 
      };
    }

    const result = response.data;
    return {
      success: result.success,
      data: result.data,
      error: result.error,
      cached: result.cached,
      cachedAt: result.cached ? new Date().toISOString() : null,
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    return { 
      success: false, 
      data: null, 
      error: 'Failed to fetch weather', 
      cached: false, 
      cachedAt: null 
    };
  }
}

/**
 * Get calendar events
 */
export async function fetchCalendarEvents(
  maxResults: number = 10
): Promise<IntegrationResult<CalendarEvent[]>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, data: null, error: 'Not authenticated', cached: false, cachedAt: null };
    }

    const response = await supabase.functions.invoke('get-calendar', {
      body: { maxResults },
    });

    if (response.error) {
      return { 
        success: false, 
        data: null, 
        error: response.error.message, 
        cached: false, 
        cachedAt: null 
      };
    }

    const result = response.data;
    return {
      success: result.success,
      data: result.data,
      error: result.error,
      cached: result.cached,
      cachedAt: result.cached ? new Date().toISOString() : null,
    };
  } catch (error) {
    console.error('Calendar fetch error:', error);
    return { 
      success: false, 
      data: null, 
      error: 'Failed to fetch calendar events', 
      cached: false, 
      cachedAt: null 
    };
  }
}

/**
 * Get health/biometric data
 */
export async function fetchHealthData(): Promise<IntegrationResult<HealthData>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, data: null, error: 'Not authenticated', cached: false, cachedAt: null };
    }

    const response = await supabase.functions.invoke('get-health', {
      body: {},
    });

    if (response.error) {
      return { 
        success: false, 
        data: null, 
        error: response.error.message, 
        cached: false, 
        cachedAt: null 
      };
    }

    const result = response.data;
    return {
      success: result.success,
      data: result.data,
      error: result.error,
      cached: result.cached,
      cachedAt: result.cached ? new Date().toISOString() : null,
    };
  } catch (error) {
    console.error('Health fetch error:', error);
    return { 
      success: false, 
      data: null, 
      error: 'Failed to fetch health data', 
      cached: false, 
      cachedAt: null 
    };
  }
}

// ============================================
// OAUTH HELPERS
// ============================================

/**
 * Get OAuth URL for a provider
 */
export function getOAuthUrl(provider: IntegrationProvider): string | null {
  const config = INTEGRATION_CONFIGS[provider];
  if (!config.requiresOAuth) return null;

  // These would be constructed based on provider
  // For now, return placeholder
  switch (provider) {
    case 'google_calendar':
      return 'https://accounts.google.com/o/oauth2/v2/auth';
    case 'oura':
      return 'https://cloud.ouraring.com/oauth/authorize';
    case 'spotify':
      return 'https://accounts.spotify.com/authorize';
    default:
      return null;
  }
}

// ============================================
// MOCK DATA FALLBACKS
// ============================================

/**
 * Get mock weather data when API is not configured
 */
export function getMockWeather(): WeatherData {
  const conditions = ['Clear', 'Cloudy', 'Rain'] as const;
  return {
    temperature: 68 + Math.floor(Math.random() * 20),
    feelsLike: 65 + Math.floor(Math.random() * 20),
    humidity: 40 + Math.floor(Math.random() * 40),
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    icon: '01d',
    description: 'Partly cloudy',
    location: 'Your Location',
    sunrise: new Date(Date.now() - 3600000 * 6).toISOString(),
    sunset: new Date(Date.now() + 3600000 * 6).toISOString(),
    windSpeed: 5 + Math.floor(Math.random() * 15),
    visibility: 10,
  };
}

/**
 * Get mock health data when API is not configured
 */
export function getMockHealth(): HealthData {
  const qualities = ['excellent', 'good', 'fair', 'poor'] as const;
  return {
    recoveryScore: 60 + Math.floor(Math.random() * 40),
    sleepHours: 5 + Math.random() * 4,
    sleepQuality: qualities[Math.floor(Math.random() * 2)], // Bias toward good
    heartRateResting: 55 + Math.floor(Math.random() * 20),
    heartRateVariability: 30 + Math.floor(Math.random() * 50),
    stepsToday: 2000 + Math.floor(Math.random() * 8000),
    activeCalories: 100 + Math.floor(Math.random() * 400),
    readinessScore: 60 + Math.floor(Math.random() * 40),
  };
}
