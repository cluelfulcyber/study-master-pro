import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

const FASTAPI_BASE_URL = "https://study-master-pro-production.up.railway.app";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path");
    const method = (url.searchParams.get("method") ?? req.method).toUpperCase();

    if (!path) {
      return new Response(
        JSON.stringify({ error: "Missing 'path' query parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const targetUrl = `${FASTAPI_BASE_URL}${path}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    let body: string | undefined = undefined;
    if (method !== "GET" && method !== "HEAD") {
      body = await req.text();
    }

    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    const responseText = await response.text();
    const contentType = response.headers.get("Content-Type") ?? "application/json";

    return new Response(responseText || null, {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.error("Error in fastapi-proxy:", error);
    return new Response(
      JSON.stringify({ error: "Proxy request failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
