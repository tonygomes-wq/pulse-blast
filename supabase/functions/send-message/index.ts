import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { settings, number, textMessage } = await req.json()

    if (!settings || !settings.url || !settings.apiKey || !settings.instance) {
      return new Response(JSON.stringify({ error: 'API settings are missing' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    if (!number || !textMessage) {
      return new Response(JSON.stringify({ error: 'Number or textMessage is missing' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let apiUrl = settings.url.replace(/\/$/, "");
    if (apiUrl.startsWith("http://")) {
      apiUrl = apiUrl.replace("http://", "https://");
    }
    const encodedInstance = encodeURIComponent(settings.instance);
    const externalApiUrl = `${apiUrl}/message/sendText/${encodedInstance}`;

    const response = await fetch(externalApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': settings.apiKey,
      },
      body: JSON.stringify({
        number: number,
        textMessage: textMessage,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown API error" }));
      return new Response(JSON.stringify({ error: errorData.message || `API returned status ${response.status}` }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const responseData = await response.json();
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})