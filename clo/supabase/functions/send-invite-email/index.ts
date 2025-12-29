/// <reference path="../deno.d.ts" />
// Supabase Edge Function: send-invite-email
// Sends invite emails to partners using Supabase's built-in email system

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
  invitee_email: string;
  inviter_name: string;
  invite_token: string;
  capsule_id: string;
}

interface EmailResponse {
  success: boolean;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables not configured");
    }

    // Verify the request is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Create Supabase admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the calling user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { invitee_email, inviter_name, invite_token, capsule_id }: InviteEmailRequest = await req.json();

    if (!invitee_email || !invite_token) {
      throw new Error("Missing required fields: invitee_email and invite_token are required");
    }

    // Verify the user owns this capsule
    const { data: capsule, error: capsuleError } = await supabaseAdmin
      .from("relationship_capsules")
      .select("*")
      .eq("id", capsule_id)
      .eq("user_a_id", user.id)
      .single();

    if (capsuleError || !capsule) {
      throw new Error("Capsule not found or access denied");
    }

    // Format the display name
    const displayName = inviter_name || user.email?.split("@")[0] || "Someone";

    // Use Supabase's built-in invite functionality
    // This sends an email using Supabase's configured SMTP
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      invitee_email,
      {
        data: {
          // Store metadata that will be available after signup
          invited_by: user.id,
          invited_by_name: displayName,
          capsule_id: capsule_id,
          invite_token: invite_token,
          invite_type: "nest_invite",
        },
        redirectTo: `${supabaseUrl.replace('.supabase.co', '')}/auth/callback?invite_token=${invite_token}`,
      }
    );

    if (inviteError) {
      console.error("Supabase invite error:", inviteError);
      
      // Check if user already exists - that's okay, we just need to notify them differently
      if (inviteError.message?.includes("already been registered")) {
        // User exists - we could send a different notification or just return success
        // For now, return a specific message
        const response: EmailResponse = {
          success: true,
          message: `User ${invitee_email} already has an account. They can use the invite code to connect.`,
        };
        
        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      throw new Error(inviteError.message || "Failed to send invite email");
    }

    // Update the capsule to mark that the invite was sent
    await supabaseAdmin
      .from("relationship_capsules")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", capsule_id);

    const response: EmailResponse = {
      success: true,
      message: `Invite email sent to ${invitee_email}`,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-invite-email:", error);

    const response: EmailResponse = {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500,
    });
  }
});
