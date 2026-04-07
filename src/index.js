// src/index.js - Versión optimizada para InproShield & LinkShield (Bypass Geográfico) [cite: 79]

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Validación de Ruta y Método [cite: 82, 83]
    if (url.pathname !== "/api/valorar") {
      return new Response(JSON.stringify({ error: "Ruta no encontrada" }), { status: 404 });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: "Método no permitido" }), { status: 405 });
    }

    try {
      const body = await request.json();
      
      // 2. Configuración de la API de Gemini (Usando v1beta para JSON Schema) [cite: 87, 88]
      // Nota: Smart Placement de Cloudflare enrutará esto desde una IP permitida [cite: 59]
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

      // 3. Inyección de Esquema JSON Estricto (Previene error $NaN) [cite: 36, 43, 52]
      const geminiPayload = {
        contents: body.contents || [{ parts: [{ text: "Analiza la integridad del sistema." }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: {
            type: "object",
            properties: {
              integrity_score: { type: "number", description: "Valor entre 0 y 100" },
              vulnerability_detected: { type: "boolean" },
              threat_levels: { type: "array", items: { type: "string" } }
            },
            required: ["integrity_score", "vulnerability_detected"]
          }
        }
      };

      // 4. Ejecución de la solicitud con el Bypass de Cloudflare [cite: 90, 112]
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload)
      });

      const result = await geminiResponse.json();

      // 5. Saneamiento de datos para asegurar respuesta numérica [cite: 102, 113]
      if (!result.candidates || result.candidates.length === 0) {
        return new Response(JSON.stringify({ 
          integrity_score: 0, 
          vulnerability_detected: false,
          error: "Sin respuesta de IA" 
        }), { 
          headers: { 'Content-Type': 'application/json' } 
        });
      }

      // Extraer y devolver el JSON generado por Gemini [cite: 108]
      const aiResponse = result.candidates[0].content.parts[0].text;
      return new Response(aiResponse, {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      // Fallback seguro en caso de error de red o parseo [cite: 56, 113]
      return new Response(JSON.stringify({ 
        integrity_score: 0, 
        error: "Error en el bypass de procesamiento" 
      }), { 
        status: 200, // Devolvemos 200 para que el frontend no rompa, pero con score 0
        headers: { 'Content-Type': 'application/json' } 
      });
    }
  }
};
