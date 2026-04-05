export default {
  async fetch(request, env) {
    // 1. Filtro de Seguridad: Solo permitir peticiones desde tu web
    const origin = request.headers.get("Origin");
    if (origin &&!origin.includes("inproshield.pages.dev")) {
      return new Response("No autorizado", { status: 403 });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, x-goog-api-key",
        }
      });
    }

    try {
      const body = await request.json();
      const targetUrl = new URL(env.VALORAPP_URL);
      
      // 2. Llamada a Google Cloud Run con cabecera Host y API Key correcta
      const response = await fetch(targetUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.VALORAPP_KEY, // Cabecera estándar Gemini 2026 
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
      return new Response(JSON.stringify({ error: "Proxy Error", details: err.message }), { status: 500 });
    }
  }
};
