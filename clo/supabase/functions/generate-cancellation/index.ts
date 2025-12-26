// Supabase Edge Function: generate-cancellation
// Uses OpenAI GPT-4o to generate formal subscription cancellation letters

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CancellationRequest {
  subscription_name: string;
  user_name: string;
  user_email?: string;
  account_number?: string;
  subscription_cost?: number;
  billing_frequency?: string;
  reason?: string;
  state?: string; // US state for applicable laws
}

interface CancellationResponse {
  letter: string;
  subject_line: string;
  key_points: string[];
  legal_references: string[];
  recommended_send_method: "email" | "certified_mail" | "online_portal";
  follow_up_date: string; // ISO date string for when to follow up
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured in Supabase Secrets");
    }

    const requestData: CancellationRequest = await req.json();

    if (!requestData.subscription_name || !requestData.user_name) {
      return new Response(
        JSON.stringify({
          error: "subscription_name and user_name are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build the prompt for OpenAI
    const prompt = buildCancellationPrompt(requestData);

    // Call OpenAI API
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are a consumer rights expert who helps users cancel subscriptions effectively. Generate professional, firm but polite cancellation letters that cite relevant consumer protection laws. Always respond with valid JSON matching the specified schema. The letter should be ready to send - include proper formatting, date, and signature line.`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.4,
        }),
      }
    );

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const openaiData = await openaiResponse.json();
    const cancellationData: CancellationResponse = JSON.parse(
      openaiData.choices[0].message.content
    );

    return new Response(JSON.stringify(cancellationData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating cancellation letter:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to generate cancellation letter",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function buildCancellationPrompt(data: CancellationRequest): string {
  const today = new Date().toISOString().split("T")[0];
  const followUpDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  let context = `Generate a subscription cancellation letter with the following details:

Subscription Service: ${data.subscription_name}
Customer Name: ${data.user_name}
Today's Date: ${today}`;

  if (data.user_email) {
    context += `\nCustomer Email: ${data.user_email}`;
  }
  if (data.account_number) {
    context += `\nAccount Number: ${data.account_number}`;
  }
  if (data.subscription_cost && data.billing_frequency) {
    context += `\nCost: $${data.subscription_cost} per ${data.billing_frequency}`;
  }
  if (data.reason) {
    context += `\nReason for Cancellation: ${data.reason}`;
  }
  if (data.state) {
    context += `\nCustomer State: ${data.state} (include state-specific consumer protection laws)`;
  }

  context += `

Respond with a JSON object containing:
{
  "letter": "<the complete, ready-to-send cancellation letter with proper formatting>",
  "subject_line": "<email subject line if sending via email>",
  "key_points": ["<list of key points made in the letter>"],
  "legal_references": ["<list of consumer protection laws/regulations cited>"],
  "recommended_send_method": "<'email' | 'certified_mail' | 'online_portal'>",
  "follow_up_date": "${followUpDate}"
}

The letter should:
1. Be professional and firm but polite
2. Request immediate cancellation and confirmation
3. Request refund of any prorated amount if applicable
4. Cite relevant consumer protection laws (CCPA if California, FTC regulations, state laws)
5. Include a clear deadline for response (14 days)
6. Request written confirmation of cancellation
7. State that you will dispute any future charges as unauthorized`;

  return context;
}
