import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are GharSeva's friendly customer support assistant. You help home owners and workers with questions about our domestic help services.

About GharSeva:
- GharSeva connects home owners with verified domestic help (maids, cooks, drivers, gardeners)
- We offer a 7-day free trial before you commit
- Subscription plans: Standard (₹499/month) and Premium (₹999/month)
- Non-subscribed users pay ₹2 per finalized booking, with a maximum of 3 calls

Services we offer:
1. Domestic Help/Cleaning - Regular house cleaning, deep cleaning, laundry
2. Cooking - Daily meals, special occasions, specific cuisines
3. Driving - Personal driver, pick-up/drop, outstation trips
4. Gardening - Garden maintenance, plant care, landscaping

Key features:
- All workers are background verified
- You get matched with 5 best workers for your needs
- You can schedule a call with workers before trial
- 7-day trial period to test the match
- Easy booking through our platform

For workers:
- Register through our For Workers portal
- Get verified and matched with families
- Flexible working hours
- Earn bonuses and awards
- Health and accident insurance

Be helpful, concise, and friendly. If you don't know something specific about a user's booking, politely suggest they check their dashboard or contact WhatsApp support at +91 98765 43210.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Determine context-specific system prompt
    let contextPrompt = SYSTEM_PROMPT;
    if (context === 'worker') {
      contextPrompt = `You are GharSeva's friendly worker support assistant. You help domestic workers with questions about registration, verification, earnings, and benefits.

About GharSeva for Workers:
- GharSeva connects domestic workers (maids, cooks, drivers, gardeners) with verified families
- Workers can register through our portal and get verified
- After verification, workers get matched with families in their preferred areas
- Workers can earn bonuses and awards like "Worker of the Month"

Worker Benefits:
- Free registration and verification
- Health and accident insurance after 6 months
- Regular work with good families
- Monthly bonuses for top performers
- Festival bonuses and gifts
- Training and skill development

Verification Process:
1. Submit ID proof (Aadhaar, PAN, Voter ID)
2. Background verification (2-3 days)
3. Skills assessment call
4. Profile activation and matching

Earnings & Bonuses:
- Workers keep 100% of their salary from families
- Top performers get monthly bonuses (₹500-2000)
- "Worker of the Month" award with ₹1000 bonus
- Festival bonuses during Diwali, Holi

Be helpful, concise, and friendly. Speak simply as many workers may not be fluent in English. If you don't know something specific, suggest they contact WhatsApp support at +91 98765 43210.`;
    }

    console.log("Calling Lovable AI gateway with", messages.length, "messages, context:", context || 'owner');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: contextPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI gateway error: " + errorText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Successfully got response from AI gateway, streaming...");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat-support error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
