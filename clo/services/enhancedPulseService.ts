/**
 * Enhanced Pulse Service
 * 
 * Tries real API integrations first, falls back to mock data.
 * This provides a seamless experience whether or not APIs are configured.
 */

import {
  fetchWeather,
  fetchHealthData,
  fetchCalendarEvents,
  getMockWeather,
  getMockHealth,
} from '@/services/integrationService';
import {
  BioMetrics,
  HomeStatus,
  RelationshipContext,
  DashboardData,
} from '@/services/pulseService';
import { WeatherData, HealthData, CalendarEvent } from '@/types/integrations';

// ============================================
// ENHANCED DATA FETCHERS
// ============================================

/**
 * Get biometrics - tries Oura first, falls back to mock
 */
export async function getEnhancedBioMetrics(): Promise<{
  data: BioMetrics;
  source: 'oura' | 'apple_health' | 'mock';
}> {
  try {
    const result = await fetchHealthData();
    
    if (result.success && result.data) {
      const health = result.data;
      return {
        data: {
          recoveryScore: health.recoveryScore,
          sleepHours: Math.round(health.sleepHours * 10) / 10,
          mood: health.sleepQuality === 'excellent' || health.sleepQuality === 'good' 
            ? (health.recoveryScore > 80 ? 'excellent' : 'good')
            : (health.recoveryScore > 50 ? 'fair' : 'poor'),
          heartRateResting: health.heartRateResting,
          stepsToday: health.stepsToday,
        },
        source: 'oura',
      };
    }
  } catch (error) {
    console.log('Health API not available, using mock data');
  }

  // Fall back to mock
  const mock = getMockHealth();
  return {
    data: {
      recoveryScore: mock.recoveryScore,
      sleepHours: Math.round(mock.sleepHours * 10) / 10,
      mood: mock.sleepQuality === 'excellent' ? 'excellent' :
            mock.sleepQuality === 'good' ? 'good' :
            mock.sleepQuality === 'fair' ? 'fair' : 'poor',
      heartRateResting: mock.heartRateResting,
      stepsToday: mock.stepsToday,
    },
    source: 'mock',
  };
}

/**
 * Get home/weather status - tries OpenWeatherMap first, falls back to mock
 */
export async function getEnhancedHomeStatus(): Promise<{
  data: HomeStatus;
  source: 'openweathermap' | 'mock';
}> {
  try {
    const result = await fetchWeather();
    
    if (result.success && result.data) {
      const weather = result.data;
      return {
        data: {
          temperature: weather.temperature,
          humidity: weather.humidity,
          condition: weather.condition as HomeStatus['condition'],
          securityStatus: 'secure', // Would come from smart home integration
          devices: [
            { name: 'Front Door', status: 'off' },
            { name: 'Thermostat', status: 'on' },
          ],
        },
        source: 'openweathermap',
      };
    }
  } catch (error) {
    console.log('Weather API not available, using mock data');
  }

  // Fall back to mock
  const mock = getMockWeather();
  return {
    data: {
      temperature: mock.temperature,
      humidity: mock.humidity,
      condition: mock.condition as HomeStatus['condition'],
      securityStatus: 'secure',
      devices: [
        { name: 'Front Door', status: 'off' },
        { name: 'Thermostat', status: 'on' },
      ],
    },
    source: 'mock',
  };
}

/**
 * Get relationship context - tries Google Calendar first, falls back to mock
 */
export async function getEnhancedRelationshipContext(): Promise<{
  data: RelationshipContext;
  source: 'google_calendar' | 'mock';
}> {
  try {
    const result = await fetchCalendarEvents(5);
    
    if (result.success && result.data && result.data.length > 0) {
      const events = result.data;
      const now = new Date();
      
      // Find the next event with attendees (likely a meeting)
      const nextMeetingEvent = events.find(e => 
        e.attendees.length > 0 && new Date(e.startTime) > now
      );
      
      // Find any event today
      const nextEvent = events.find(e => new Date(e.startTime) > now);
      
      return {
        data: {
          nextMeeting: nextEvent ? {
            name: nextEvent.title,
            time: nextEvent.startTime,
          } : null,
          overdueContact: null, // Would come from relationship capsules
          upcomingAnniversary: null, // Would come from relationship capsules
        },
        source: 'google_calendar',
      };
    }
  } catch (error) {
    console.log('Calendar API not available, using mock data');
  }

  // Fall back to mock
  const names = ['Sarah', 'Alex', 'Jordan', 'Taylor', 'Morgan'];
  const randomName = names[Math.floor(Math.random() * names.length)];
  const hasNextMeeting = Math.random() > 0.3;
  
  const meetingTime = new Date();
  meetingTime.setHours(meetingTime.getHours() + 2 + Math.floor(Math.random() * 6));
  
  return {
    data: {
      nextMeeting: hasNextMeeting ? {
        name: `Coffee with ${randomName}`,
        time: meetingTime.toISOString(),
      } : null,
      overdueContact: Math.random() > 0.5 ? {
        name: randomName,
        daysSinceContact: 7 + Math.floor(Math.random() * 23),
      } : null,
      upcomingAnniversary: null,
    },
    source: 'mock',
  };
}

// ============================================
// ENHANCED SYNC
// ============================================

export interface EnhancedDashboardData extends DashboardData {
  sources: {
    bioMetrics: 'oura' | 'apple_health' | 'mock';
    homeStatus: 'openweathermap' | 'mock';
    relationshipContext: 'google_calendar' | 'mock';
  };
}

/**
 * Sync all dashboard data with real API support
 */
export async function syncEnhancedData(): Promise<EnhancedDashboardData> {
  const [bioResult, homeResult, relResult] = await Promise.all([
    getEnhancedBioMetrics(),
    getEnhancedHomeStatus(),
    getEnhancedRelationshipContext(),
  ]);

  return {
    bioMetrics: bioResult.data,
    homeStatus: homeResult.data,
    relationshipContext: relResult.data,
    syncedAt: new Date().toISOString(),
    sources: {
      bioMetrics: bioResult.source,
      homeStatus: homeResult.source,
      relationshipContext: relResult.source,
    },
  };
}

// ============================================
// HELPER TO CHECK INTEGRATION STATUS
// ============================================

export async function getIntegrationStatus(): Promise<{
  weather: boolean;
  calendar: boolean;
  health: boolean;
}> {
  // Quick check - try to fetch and see what works
  const [weatherResult, calendarResult, healthResult] = await Promise.all([
    fetchWeather().catch(() => ({ success: false })),
    fetchCalendarEvents(1).catch(() => ({ success: false })),
    fetchHealthData().catch(() => ({ success: false })),
  ]);

  return {
    weather: weatherResult.success,
    calendar: calendarResult.success,
    health: healthResult.success,
  };
}
