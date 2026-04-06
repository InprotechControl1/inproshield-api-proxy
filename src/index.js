export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Verificar que sea la ruta correcta
    if (url.pathname !== "/api/valorar") {
      return new Response(JSON.stringify({ error: "Ruta no válida" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Manejo de CORS para inproshield.pages.dev
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "https://inproshield.pages.dev",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        }
      });
    }

    // Solo aceptar POST
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Método no permitido. Use POST." }), {
        status: 405,
        headers: { 
          "Content-Type": "application/json",
          "Allow": "POST"
        }
      });
    }

    try {
      const propertyData = await request.json();
      const prompt = propertyData.prompt || "Analiza la integridad del sistema.";

      // Usa la API Key desde el secreto
      const GEMINI_API_KEY = env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        return new Response(JSON.stringify({ error: "API Key no configurada" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Payload con JSON Schema (evita NaN)
      const geminiPayload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: {
            type: "object",
            properties: {
              integrity_score: { type: "number", description: "0-100" },
              vulnerability_detected: { type: "boolean" },
              threat_levels: { type: "array", items: { type: "string" } }
            },
            required: ["integrity_score", "vulnerability_detected"]
          }
        }
      };

      // Llamada directa a Gemini API
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;
      
      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiPayload)
      });

      const geminiData = await response.json();

      // Manejo de errores de Gemini
      if (geminiData.error) {
        return new Response(JSON.stringify({ error: geminiData.error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Saneamiento: NUNCA devolver NaN
      let result = {
        integrity_score: 0,
        vulnerability_detected: false,
        threat_levels: []
      };

      const candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidateText) {
        try {
          const parsed = JSON.parse(candidateText);
          result = {
            integrity_score: typeof parsed.integrity_score === "number" ? parsed.integrity_score : 0,
            vulnerability_detected: !!parsed.vulnerability_detected,
            threat_levels: Array.isArray(parsed.threat_levels) ? parsed.threat_levels : []
          };
        } catch (e) {
          console.error("Error parseando JSON:", e);
        }
      }

      return new Response(JSON.stringify(result), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://inproshield.pages.dev"
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({ 
        error: "Fallo en el motor de IA", 
        details: err.message 
      }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
