export default {
  async fetch(request, env) {
    // 1. Manejo de CORS (Vital para que inproshield.pages.dev pueda llamar a la API)
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
      const propertyData = await request.json();

      // 2. Construcción del Prompt para Gemini
      // Aquí definimos la lógica que antes hacía tu Cloud Run
      const geminiPayload = {
        contents:
        }]
      };

      // 3. Llamada Directa a Google Gemini (Bypass Cloud Run)
      const response = await fetch(`${env.VALORAPP_URL}?key=${env.VALORAPP_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiPayload)
      });

      const result = await response.json();
      
      // 4. Devolvemos la respuesta formateada a tu web
      return new Response(JSON.stringify(result), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: "Fallo en el motor de IA", details: err.message }), { status: 500 });
    }
  }
};
