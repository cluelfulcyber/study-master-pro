import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, difficulty, language = "en" } = await req.json();

    if (!subject || !difficulty) {
      throw new Error("Subject and difficulty are required");
    }

    // Validate subject input
    const trimmedSubject = subject.trim();
    if (trimmedSubject.length < 3 || trimmedSubject.length > 500) {
      throw new Error("Subject must be between 3 and 500 characters");
    }
    
    if (!/^[a-zA-Z0-9\s.,!?'\-—–()""''«»]*$/.test(trimmedSubject)) {
      throw new Error("Subject contains invalid characters");
    }

    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Generate summary using OpenAI
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const systemPrompt = `You are an expert educational assistant. Your task is to create comprehensive, well-structured study materials.

Based on the difficulty level:
- SIMPLE: Use basic language, short paragraphs, simple examples, and focus on core concepts only. Perfect for beginners.
- NORMAL: Use moderate complexity, balanced detail, practical examples, and cover main concepts with some depth.
- ADVANCED: Use technical language, in-depth analysis, complex examples, and cover comprehensive details with nuances.

Format your response using Markdown with:
- Clear headings (## for main sections)
- Bullet points for lists
- **Bold** for key terms
- Code blocks for technical content (if applicable)
- Short, focused paragraphs

Make it engaging, accurate, and easy to scan.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Create a ${difficulty} level study summary for: ${trimmedSubject}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", { status: response.status, error: errorText });
      if (response.status === 401) {
        throw new Error("Invalid OpenAI API key. Please check your OPENAI_API_KEY configuration.");
      }
      throw new Error("Failed to generate summary");
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;

    // Save to database
    const { data: session, error: dbError } = await supabase
      .from("study_sessions")
      .insert({
        user_id: user.id,
        subject,
        difficulty,
        summary,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database operation failed:", { code: dbError.code, message: dbError.message });
      throw new Error("Failed to save session");
    }

    return new Response(
      JSON.stringify({
        summary,
        sessionId: session.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-summary:", { message: error instanceof Error ? error.message : "Unknown error" });
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
