/// <reference path="../deno.d.ts" />
// Supabase Edge Function: enrich-inventory-item
// Uses OpenAI GPT-4o to enrich inventory items with warranty info, manuals, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EnrichmentRequest {
  barcode?: string;
  name?: string;
  category?: string;
  brand?: string;
}

interface EnrichmentResponse {
  warranty_months: number | null;
  manual_url: string | null;
  support_phone: string | null;
  support_url: string | null;
  suggested_maintenance: Array<{
    task: string;
    frequency_months: number;
  }>;
  product_info: {
    full_name: string | null;
    brand: string | null;
    model: string | null;
    category: string | null;
  };
  confidence: "high" | "medium" | "low";
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

    const { barcode, name, category, brand }: EnrichmentRequest =
      await req.json();

    if (!barcode && !name) {
      return new Response(
        JSON.stringify({ error: "Either barcode or name is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build the prompt for OpenAI
    const prompt = buildEnrichmentPrompt({ barcode, name, category, brand });

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
              content: `You are a product research assistant. Given product information, provide detailed warranty, support, and maintenance information. Always respond with valid JSON matching the specified schema. If you cannot find specific information, use null for that field. Be conservative with warranty estimates - only provide numbers you're confident about.`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.3, // Lower temperature for more factual responses
        }),
      }
    );

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const openaiData = await openaiResponse.json() as { choices: Array<{ message: { content: string } }> };
    const enrichmentData: EnrichmentResponse = JSON.parse(
      openaiData.choices[0].message.content
    );

    return new Response(JSON.stringify(enrichmentData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err as Error;
    console.error("Error enriching inventory item:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to enrich inventory item",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function buildEnrichmentPrompt(data: EnrichmentRequest): string {
  const parts: string[] = [];

  if (data.barcode) {
    parts.push(`Barcode/UPC: ${data.barcode}`);
  }
  if (data.name) {
    parts.push(`Product Name: ${data.name}`);
  }
  if (data.brand) {
    parts.push(`Brand: ${data.brand}`);
  }
  if (data.category) {
    parts.push(`Category: ${data.category}`);
  }

  return `Research this product and provide enrichment data:

${parts.join("\n")}

Respond with a JSON object containing:
{
  "warranty_months": <number or null - typical manufacturer warranty in months>,
  "manual_url": <string or null - URL to product manual/documentation if known>,
  "support_phone": <string or null - manufacturer support phone number>,
  "support_url": <string or null - manufacturer support website>,
  "suggested_maintenance": [
    { "task": "<maintenance task description>", "frequency_months": <number> }
  ],
  "product_info": {
    "full_name": <string or null - complete product name>,
    "brand": <string or null - manufacturer/brand>,
    "model": <string or null - model number if identifiable>,
    "category": <string or null - product category>
  },
  "confidence": <"high" | "medium" | "low" - how confident you are in this data>
}

For suggested_maintenance, include common maintenance tasks for this type of product (e.g., filter replacement for HVAC, descaling for coffee makers, etc.).`;
}
