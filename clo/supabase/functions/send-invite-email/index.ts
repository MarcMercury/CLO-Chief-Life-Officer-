/// <reference path="../deno.d.ts" />
// Supabase Edge Function: send-invite-email
// Sends invite emails using Resend API directly

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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables not configured");
    }

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured. Please set it in Supabase secrets.");
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
    
    // Format the invite code for display (uppercase, with dashes if needed)
    const formattedCode = invite_token.substring(0, 8).toUpperCase();

    // Create the email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to Connect</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="500" cellpadding="0" cellspacing="0" style="max-width: 500px;">
          <!-- Header with heart icon -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #ec4899, #f43f5e); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 28px;">💕</span>
              </div>
            </td>
          </tr>
          
          <!-- Main content -->
          <tr>
            <td style="background: linear-gradient(180deg, rgba(236, 72, 153, 0.1) 0%, rgba(10, 10, 10, 1) 100%); border-radius: 24px; padding: 40px 30px; border: 1px solid rgba(236, 72, 153, 0.2);">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 600; text-align: center; margin: 0 0 16px 0;">
                You're Invited! 💝
              </h1>
              
              <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; text-align: center; margin: 0 0 30px 0;">
                <strong style="color: #ec4899;">${displayName}</strong> wants to create a shared Nest with you in CLO (Chief Life Officer).
              </p>
              
              <!-- Invite code box -->
              <div style="background-color: rgba(236, 72, 153, 0.1); border: 2px dashed rgba(236, 72, 153, 0.4); border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 30px;">
                <p style="color: #a1a1aa; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">
                  Your Invite Code
                </p>
                <p style="color: #ec4899; font-size: 32px; font-weight: 700; letter-spacing: 4px; margin: 0; font-family: 'SF Mono', Monaco, monospace;">
                  ${formattedCode}
                </p>
              </div>
              
              <!-- Instructions -->
              <div style="background-color: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <p style="color: #ffffff; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">
                  To accept this invite:
                </p>
                <ol style="color: #a1a1aa; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Download CLO from the App Store</li>
                  <li>Create your account or sign in</li>
                  <li>Go to Relationships → Join Nest</li>
                  <li>Enter the invite code above</li>
                </ol>
              </div>
              
              <!-- What is a Nest -->
              <p style="color: #71717a; font-size: 13px; text-align: center; margin: 0;">
                A Nest is a private shared space where you can check in on each other, share moments, and stay connected. 🏠
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding-top: 30px; text-align: center;">
              <p style="color: #52525b; font-size: 12px; margin: 0;">
                Sent with 💕 from CLO
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Send email via Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CLO App <noreply@crateso.com>",
        to: [invitee_email],
        subject: `${displayName} invited you to their Nest 💕`,
        html: emailHtml,
      }),
    });

    const resendResult = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API error:", resendResult);
      throw new Error(resendResult.message || "Failed to send email via Resend");
    }

    console.log("Email sent successfully:", resendResult);

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
