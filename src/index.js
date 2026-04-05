export default {
  async fetch(request, env) {
    // 1. Manejo de CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, X-API-KEY",
        }
      });
    }

    try {
      const body = await request.json();
      const targetUrl = new URL(env.VALORAPP_URL);
      
      // 2. Llamada a Google Cloud Run con fix de Host header
      // Importante: Cloud Run rechaza peticiones si el Host no coincide [3, 4]
      const response = await fetch(targetUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": env.VALORAPP_KEY,
          "Host": targetUrl.hostname 
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "API Proxy Error", msg: err.message }), { status: 500 });
    }
  }
};
