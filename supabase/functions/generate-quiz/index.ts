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
    const { subject, sessionId, language = "en" } = await req.json();

    if (!subject || !sessionId) {
      throw new Error("Subject and sessionId are required");
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

    // Generate quiz using OpenAI
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const languageInstruction = language === "bg" 
      ? "IMPORTANT: All questions, options, and explanations MUST be in Bulgarian language."
      : "All content should be in English.";

    const systemPrompt = `You are an expert quiz generator. ${languageInstruction} Create 5 multiple-choice questions about the given subject.

CRITICAL: You MUST respond with ONLY valid JSON in this EXACT format:
{
  "questions": [
    {
      "question": "What is...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "A brief explanation of why the correct answer is right and why others are wrong"
    }
  ]
}

Requirements:
- Exactly 5 questions
- Each question has exactly 4 options
- "correct" is the index (0-3) of the correct answer
- "explanation" must be a clear, concise explanation (2-3 sentences) that teaches the concept
- Questions should test understanding, not just memorization
- Options should be plausible but clearly distinct
- NO additional text, NO markdown, ONLY the JSON object`;

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
            content: `Generate 5 quiz questions about: ${trimmedSubject}`,
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
      throw new Error("Failed to generate quiz");
    }

    const data = await response.json();
    let quizContent = data.choices[0].message.content;

    // Clean up the response - remove markdown code blocks if present
    quizContent = quizContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // Parse the JSON
    let questions;
    try {
      const parsed = JSON.parse(quizContent);
      questions = parsed.questions;

      // Validate the structure
      if (!Array.isArray(questions) || questions.length !== 5) {
        throw new Error("Invalid number of questions");
      }

      questions.forEach((q, idx) => {
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correct !== "number" || !q.explanation) {
          throw new Error(`Invalid question format at index ${idx}`);
        }
      });
    } catch (parseError) {
      console.error("Failed to parse quiz JSON:", { error: parseError instanceof Error ? parseError.message : "Parse error" });
      throw new Error("Failed to parse quiz format");
    }

    return new Response(
      JSON.stringify({ questions }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-quiz:", { message: error instanceof Error ? error.message : "Unknown error" });
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
