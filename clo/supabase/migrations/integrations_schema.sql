-- ============================================
-- CLO Integrations Schema
-- Phase 6: Real API Integrations
-- ============================================

-- Integrations table stores OAuth tokens and API keys
CREATE TABLE IF NOT EXISTS public.integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    
    -- OAuth tokens (encrypted at rest by Supabase)
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    
    -- API key for simple integrations
    api_key_encrypted TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMPTZ,
    last_error TEXT,
    
    -- Provider-specific config (location for weather, etc.)
    config JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- One integration per provider per user
    UNIQUE(user_id, provider)
);

-- Cache table for API responses (reduces API calls)
CREATE TABLE IF NOT EXISTS public.integration_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    cache_key TEXT NOT NULL,
    data JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- One cache entry per key per provider per user
    UNIQUE(user_id, provider, cache_key)
);

-- Enable RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for integrations
CREATE POLICY "Users can view their own integrations"
    ON public.integrations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integrations"
    ON public.integrations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations"
    ON public.integrations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations"
    ON public.integrations FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for cache
CREATE POLICY "Users can manage their own cache"
    ON public.integration_cache FOR ALL
    USING (auth.uid() = user_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER integrations_updated_at
    BEFORE UPDATE ON public.integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_integrations_updated_at();

-- Helper function to get cached data
CREATE OR REPLACE FUNCTION get_cached_data(
    p_user_id UUID,
    p_provider TEXT,
    p_cache_key TEXT
)
RETURNS JSONB AS $$
DECLARE
    cached_data JSONB;
BEGIN
    SELECT data INTO cached_data
    FROM public.integration_cache
    WHERE user_id = p_user_id
      AND provider = p_provider
      AND cache_key = p_cache_key
      AND expires_at > now();
    
    RETURN cached_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to set cached data
CREATE OR REPLACE FUNCTION set_cached_data(
    p_user_id UUID,
    p_provider TEXT,
    p_cache_key TEXT,
    p_data JSONB,
    p_ttl_minutes INT DEFAULT 15
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.integration_cache (user_id, provider, cache_key, data, expires_at)
    VALUES (p_user_id, p_provider, p_cache_key, p_data, now() + (p_ttl_minutes || ' minutes')::interval)
    ON CONFLICT (user_id, provider, cache_key)
    DO UPDATE SET 
        data = EXCLUDED.data,
        expires_at = EXCLUDED.expires_at,
        created_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.integration_cache
    WHERE expires_at < now();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_integrations_user_provider 
    ON public.integrations(user_id, provider);

CREATE INDEX IF NOT EXISTS idx_cache_expiry 
    ON public.integration_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_cache_lookup 
    ON public.integration_cache(user_id, provider, cache_key);
