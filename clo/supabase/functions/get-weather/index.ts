/// <reference path="../deno.d.ts" />
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WeatherRequest {
  lat: number
  lon: number
  units?: 'metric' | 'imperial'
}

interface WeatherResponse {
  success: boolean
  data: {
    temperature: number
    feelsLike: number
    humidity: number
    condition: string
    icon: string
    description: string
    location: string
    sunrise: string
    sunset: string
    windSpeed: number
    visibility: number
  } | null
  error: string | null
  cached: boolean
}

// Map OpenWeatherMap conditions to our simplified conditions
function mapCondition(owmCondition: string): string {
  const conditionMap: Record<string, string> = {
    'Clear': 'Clear',
    'Clouds': 'Cloudy',
    'Rain': 'Rain',
    'Drizzle': 'Drizzle',
    'Thunderstorm': 'Thunderstorm',
    'Snow': 'Snow',
    'Mist': 'Mist',
    'Fog': 'Mist',
    'Haze': 'Mist',
    'Smoke': 'Mist',
    'Dust': 'Mist',
  }
  return conditionMap[owmCondition] || 'Clear'
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

    // Parse request body
    const { lat, lon, units = 'imperial' }: WeatherRequest = await req.json()

    if (!lat || !lon) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing lat/lon coordinates' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check cache first
    const cacheKey = `weather_${lat.toFixed(2)}_${lon.toFixed(2)}`
    const { data: cachedData } = await supabase.rpc('get_cached_data', {
      p_user_id: user.id,
      p_provider: 'openweathermap',
      p_cache_key: cacheKey
    })

    if (cachedData) {
      console.log('Returning cached weather data')
      const response: WeatherResponse = {
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

    // Get API key from user's integration or use default
    const { data: integration } = await supabase
      .from('integrations')
      .select('api_key_encrypted, config')
      .eq('user_id', user.id)
      .eq('provider', 'openweathermap')
      .eq('is_active', true)
      .single()

    // Use user's API key or fall back to environment variable
    const apiKey = integration?.api_key_encrypted || Deno.env.get('OPENWEATHERMAP_API_KEY')
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Weather API not configured. Please add your OpenWeatherMap API key.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call OpenWeatherMap API
    const owmUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`
    const owmResponse = await fetch(owmUrl)
    
    if (!owmResponse.ok) {
      const errorText = await owmResponse.text()
      console.error('OpenWeatherMap error:', errorText)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch weather data' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const owmData = await owmResponse.json() as {
      main: { temp: number; feels_like: number; humidity: number };
      weather: Array<{ main: string; icon: string; description: string }>;
      name: string;
      sys: { sunrise: number; sunset: number };
      wind: { speed: number };
      visibility?: number;
    }

    // Transform response
    const weatherData = {
      temperature: Math.round(owmData.main.temp),
      feelsLike: Math.round(owmData.main.feels_like),
      humidity: owmData.main.humidity,
      condition: mapCondition(owmData.weather[0].main),
      icon: owmData.weather[0].icon,
      description: owmData.weather[0].description,
      location: owmData.name,
      sunrise: new Date(owmData.sys.sunrise * 1000).toISOString(),
      sunset: new Date(owmData.sys.sunset * 1000).toISOString(),
      windSpeed: Math.round(owmData.wind.speed),
      visibility: Math.round((owmData.visibility || 10000) / 1000), // km
    }

    // Cache the result for 15 minutes
    await supabase.rpc('set_cached_data', {
      p_user_id: user.id,
      p_provider: 'openweathermap',
      p_cache_key: cacheKey,
      p_data: weatherData,
      p_ttl_minutes: 15
    })

    // Update last_synced_at
    if (integration) {
      await supabase
        .from('integrations')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', integration.id)
    }

    const response: WeatherResponse = {
      success: true,
      data: weatherData,
      error: null,
      cached: false
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    const error = err as Error
    console.error('Weather function error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
