/// <reference path="../deno.d.ts" />
// Oura Ring Integration Edge Function
// Fetches sleep, readiness, and activity data from Oura API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HealthData {
  recoveryScore: number
  sleepHours: number
  sleepQuality: 'excellent' | 'good' | 'fair' | 'poor'
  heartRateResting: number
  heartRateVariability: number
  stepsToday: number
  activeCalories: number
  readinessScore: number
}

interface HealthResponse {
  success: boolean
  data: HealthData | null
  error: string | null
  cached: boolean
}

function getSleepQuality(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 85) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 50) return 'fair'
  return 'poor'
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get user from token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check cache first
    const today = new Date().toISOString().split('T')[0]
    const cacheKey = `health_${today}`
    const { data: cachedData } = await supabase.rpc('get_cached_data', {
      p_user_id: user.id,
      p_provider: 'oura',
      p_cache_key: cacheKey
    })

    if (cachedData) {
      console.log('Returning cached health data')
      const response: HealthResponse = {
        success: true,
        data: cachedData,
        error: null,
        cached: true
      }
      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's Oura integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'oura')
      .eq('is_active', true)
      .single()

    if (integrationError || !integration) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Oura Ring not connected. Please connect in Settings.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const accessToken = integration.access_token_encrypted

    // Fetch data from Oura API v2
    const startDate = today
    const endDate = today

    // Get daily readiness
    const readinessUrl = `https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${startDate}&end_date=${endDate}`
    const readinessResponse = await fetch(readinessUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })

    // Get daily sleep
    const sleepUrl = `https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${startDate}&end_date=${endDate}`
    const sleepResponse = await fetch(sleepUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })

    // Get daily activity
    const activityUrl = `https://api.ouraring.com/v2/usercollection/daily_activity?start_date=${startDate}&end_date=${endDate}`
    const activityResponse = await fetch(activityUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })

    // Get heart rate
    const hrUrl = `https://api.ouraring.com/v2/usercollection/heartrate?start_datetime=${startDate}T00:00:00Z&end_datetime=${today}T23:59:59Z`
    const hrResponse = await fetch(hrUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })

    if (!readinessResponse.ok || !sleepResponse.ok || !activityResponse.ok) {
      console.error('Oura API error')
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch health data from Oura' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    interface OuraDataResponse {
      data?: Array<{
        score?: number;
        contributors?: { total_sleep?: number; hrv_balance?: number };
        steps?: number;
        active_calories?: number;
        bpm?: number;
      }>;
    }

    const readinessData = await readinessResponse.json() as OuraDataResponse
    const sleepData = await sleepResponse.json() as OuraDataResponse
    const activityData = await activityResponse.json() as OuraDataResponse
    const hrData: OuraDataResponse = hrResponse.ok ? await hrResponse.json() as OuraDataResponse : { data: [] }

    // Extract latest data
    const latestReadiness = readinessData.data?.[0]
    const latestSleep = sleepData.data?.[0]
    const latestActivity = activityData.data?.[0]

    // Calculate average resting heart rate from overnight readings
    const hrReadings = hrData.data || []
    const avgHr = hrReadings.length > 0 
      ? Math.round(hrReadings.reduce((sum, r) => sum + (r.bpm || 0), 0) / hrReadings.length)
      : 60

    const healthData: HealthData = {
      recoveryScore: latestReadiness?.score || 70,
      readinessScore: latestReadiness?.score || 70,
      sleepHours: latestSleep?.contributors?.total_sleep 
        ? Math.round(latestSleep.contributors.total_sleep / 3600 * 10) / 10
        : 7,
      sleepQuality: getSleepQuality(latestSleep?.score || 70),
      heartRateResting: avgHr,
      heartRateVariability: latestReadiness?.contributors?.hrv_balance || 50,
      stepsToday: latestActivity?.steps || 0,
      activeCalories: latestActivity?.active_calories || 0,
    }

    // Cache for 30 minutes
    await supabase.rpc('set_cached_data', {
      p_user_id: user.id,
      p_provider: 'oura',
      p_cache_key: cacheKey,
      p_data: healthData,
      p_ttl_minutes: 30
    })

    // Update last_synced_at
    await supabase
      .from('integrations')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', integration.id)

    const response: HealthResponse = {
      success: true,
      data: healthData,
      error: null,
      cached: false
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    const error = err as Error
    console.error('Health function error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
