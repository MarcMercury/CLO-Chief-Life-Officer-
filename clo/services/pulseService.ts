/**
 * Pulse Service - Mock Data Layer for Dashboard
 * 
 * This service simulates API calls with realistic latency.
 * Replace with real integrations in Phase 6.
 */

// ============================================
// TYPES
// ============================================

export interface BioMetrics {
  recoveryScore: number; // 0-100
  sleepHours: number;
  mood: 'excellent' | 'good' | 'fair' | 'poor';
  heartRateResting: number;
  stepsToday: number;
}

export interface HomeStatus {
  temperature: number; // Fahrenheit
  humidity: number;
  condition: 'Clear' | 'Cloudy' | 'Rain' | 'Snow' | 'Thunderstorm';
  securityStatus: 'secure' | 'alert' | 'unknown';
  devices: {
    name: string;
    status: 'on' | 'off' | 'away';
  }[];
}

export interface RelationshipContext {
  nextMeeting: {
    name: string;
    time: string; // ISO string
    capsuleId?: string;
  } | null;
  overdueContact: {
    name: string;
    daysSinceContact: number;
    capsuleId?: string;
  } | null;
  upcomingAnniversary: {
    name: string;
    date: string;
    daysUntil: number;
  } | null;
}

export interface DashboardData {
  bioMetrics: BioMetrics | null;
  homeStatus: HomeStatus | null;
  relationshipContext: RelationshipContext | null;
  syncedAt: string;
}

// ============================================
// MOCK DATA GENERATORS
// ============================================

const NAMES = ['Sarah', 'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey'];
const CONDITIONS: HomeStatus['condition'][] = ['Clear', 'Cloudy', 'Rain', 'Snow'];
const MOODS: BioMetrics['mood'][] = ['excellent', 'good', 'fair', 'poor'];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function simulateNetworkDelay(): Promise<void> {
  const delay = randomInt(800, 2000);
  return new Promise(resolve => setTimeout(resolve, delay));
}

function shouldFail(): boolean {
  // 10% chance of failure
  return Math.random() < 0.1;
}

// ============================================
// SERVICE METHODS
// ============================================

/**
 * Get biometric data (simulates health device sync)
 */
export async function getBioMetrics(): Promise<BioMetrics> {
  await simulateNetworkDelay();
  
  if (shouldFail()) {
    throw new Error('Failed to sync biometrics. Check device connection.');
  }

  const recoveryScore = randomInt(40, 100);
  
  return {
    recoveryScore,
    sleepHours: parseFloat((Math.random() * 4 + 5).toFixed(1)), // 5-9 hours
    mood: recoveryScore > 80 ? 'excellent' : 
          recoveryScore > 60 ? 'good' : 
          recoveryScore > 40 ? 'fair' : 'poor',
    heartRateResting: randomInt(55, 75),
    stepsToday: randomInt(0, 5000), // Morning, so not many steps yet
  };
}

/**
 * Get smart home status (simulates HomeKit/Matter sync)
 */
export async function getHomeStatus(): Promise<HomeStatus> {
  await simulateNetworkDelay();
  
  if (shouldFail()) {
    throw new Error('Home hub not responding.');
  }

  return {
    temperature: randomInt(65, 78),
    humidity: randomInt(30, 60),
    condition: randomItem(CONDITIONS),
    securityStatus: Math.random() > 0.05 ? 'secure' : 'alert',
    devices: [
      { name: 'Front Door', status: 'off' },
      { name: 'Thermostat', status: 'on' },
      { name: 'Living Room Lights', status: Math.random() > 0.5 ? 'on' : 'off' },
    ],
  };
}

/**
 * Get relationship context (simulates capsule analysis)
 */
export async function getRelationshipContext(): Promise<RelationshipContext> {
  await simulateNetworkDelay();
  
  if (shouldFail()) {
    throw new Error('Could not load relationship data.');
  }

  const hasNextMeeting = Math.random() > 0.3;
  const hasOverdue = Math.random() > 0.5;
  const hasAnniversary = Math.random() > 0.7;

  // Generate a time for later today
  const now = new Date();
  const meetingHour = now.getHours() + randomInt(2, 8);
  const meetingTime = new Date();
  meetingTime.setHours(meetingHour, randomInt(0, 59), 0, 0);

  return {
    nextMeeting: hasNextMeeting ? {
      name: randomItem(NAMES),
      time: meetingTime.toISOString(),
    } : null,
    overdueContact: hasOverdue ? {
      name: randomItem(NAMES),
      daysSinceContact: randomInt(7, 30),
    } : null,
    upcomingAnniversary: hasAnniversary ? {
      name: randomItem(NAMES),
      date: new Date(Date.now() + randomInt(1, 14) * 24 * 60 * 60 * 1000).toISOString(),
      daysUntil: randomInt(1, 14),
    } : null,
  };
}

/**
 * Sync all dashboard data in parallel
 */
export async function syncAllData(): Promise<DashboardData> {
  const results = await Promise.allSettled([
    getBioMetrics(),
    getHomeStatus(),
    getRelationshipContext(),
  ]);

  return {
    bioMetrics: results[0].status === 'fulfilled' ? results[0].value : null,
    homeStatus: results[1].status === 'fulfilled' ? results[1].value : null,
    relationshipContext: results[2].status === 'fulfilled' ? results[2].value : null,
    syncedAt: new Date().toISOString(),
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

export function getMoodEmoji(mood: BioMetrics['mood']): string {
  switch (mood) {
    case 'excellent': return '😊';
    case 'good': return '🙂';
    case 'fair': return '😐';
    case 'poor': return '😔';
  }
}

export function getWeatherEmoji(condition: HomeStatus['condition']): string {
  switch (condition) {
    case 'Clear': return '☀️';
    case 'Cloudy': return '☁️';
    case 'Rain': return '🌧️';
    case 'Snow': return '❄️';
    case 'Thunderstorm': return '⛈️';
  }
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
