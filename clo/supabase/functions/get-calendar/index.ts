// Google Calendar Integration Edge Function
// Fetches upcoming events from user's Google Calendar

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CalendarRequest {
  maxResults?: number
  timeMin?: string // ISO date string
  timeMax?: string // ISO date string
}

interface CalendarEvent {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  location: string | null
  attendees: string[]
  isAllDay: boolean
  calendarName: string
}

interface CalendarResponse {
  success: boolean
  data: CalendarEvent[] | null
  error: string | null
  cached: boolean
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
    const { 
      maxResults = 10, 
      timeMin = new Date().toISOString(),
      timeMax 
    }: CalendarRequest = await req.json().catch(() => ({}))

    // Check cache first
    const today = new Date().toISOString().split('T')[0]
    const cacheKey = `calendar_${today}_${maxResults}`
    const { data: cachedData } = await supabase.rpc('get_cached_data', {
      p_user_id: user.id,
      p_provider: 'google_calendar',
      p_cache_key: cacheKey
    })

    if (cachedData) {
      console.log('Returning cached calendar data')
      const response: CalendarResponse = {
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

    // Get user's Google Calendar integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'google_calendar')
      .eq('is_active', true)
      .single()

    if (integrationError || !integration) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Google Calendar not connected. Please connect in Settings.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let accessToken = integration.access_token_encrypted

    // Check if token is expired
    if (integration.token_expires_at && new Date(integration.token_expires_at) < new Date()) {
      // Refresh the token
      const refreshToken = integration.refresh_token_encrypted
      if (!refreshToken) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Calendar session expired. Please reconnect.' 
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      })

      if (!tokenResponse.ok) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to refresh calendar access. Please reconnect.' 
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const tokenData = await tokenResponse.json()
      accessToken = tokenData.access_token

      // Update stored token
      await supabase
        .from('integrations')
        .update({
          access_token_encrypted: tokenData.access_token,
          token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        })
        .eq('id', integration.id)
    }

    // Call Google Calendar API
    const calendarUrl = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events')
    calendarUrl.searchParams.set('maxResults', String(maxResults))
    calendarUrl.searchParams.set('timeMin', timeMin)
    calendarUrl.searchParams.set('orderBy', 'startTime')
    calendarUrl.searchParams.set('singleEvents', 'true')
    
    if (timeMax) {
      calendarUrl.searchParams.set('timeMax', timeMax)
    }

    const calendarResponse = await fetch(calendarUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    })

    if (!calendarResponse.ok) {
      const errorText = await calendarResponse.text()
      console.error('Google Calendar error:', errorText)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch calendar events' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const calendarData = await calendarResponse.json()

    // Transform events
    const events: CalendarEvent[] = (calendarData.items || []).map((event: any) => ({
      id: event.id,
      title: event.summary || 'Untitled Event',
      description: event.description || null,
      startTime: event.start.dateTime || event.start.date,
      endTime: event.end.dateTime || event.end.date,
      location: event.location || null,
      attendees: (event.attendees || []).map((a: any) => a.email),
      isAllDay: !!event.start.date,
      calendarName: 'Primary'
    }))

    // Cache for 5 minutes
    await supabase.rpc('set_cached_data', {
      p_user_id: user.id,
      p_provider: 'google_calendar',
      p_cache_key: cacheKey,
      p_data: events,
      p_ttl_minutes: 5
    })

    // Update last_synced_at
    await supabase
      .from('integrations')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', integration.id)

    const response: CalendarResponse = {
      success: true,
      data: events,
      error: null,
      cached: false
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Calendar function error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
