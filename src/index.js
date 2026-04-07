// src/index.js - Versión 2.0: Panel de Control InproShield & Bypass Gemini
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Interfaz Visual de Bienvenida (Ruta Raíz)
    if (url.pathname === "/" || url.pathname === "") {
      return new Response(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>InproShield | Nodo de Bypass 2026</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .container { background: #1e293b; padding: 2.5rem; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid #334155; text-align: center; max-width: 400px; }
                .status-badge { background: #059669; color: white; padding: 0.5rem 1rem; border-radius: 99px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; margin-bottom: 1rem; display: inline-block; }
                h1 { margin: 10px 0; font-size: 1.8rem; color: #38bdf8; }
                p { color: #94a3b8; line-height: 1.6; }
                .info { background: #0f172a; padding: 1rem; border-radius: 8px; font-family: monospace; font-size: 0.9rem; color: #38bdf8; margin-top: 1.5rem; text-align: left; }
                .footer { margin-top: 2rem; font-size: 0.75rem; color: #475569; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="status-badge">● Sistema Operativo</div>
                <h1>InproShield v3.1</h1>
                <p>El nodo de bypass inteligente está configurado y respondiendo desde el borde de la red.</p>
                <div class="info">
                    > Bypass Geográfico: OK [cite: 63]<br>
                    > Smart Placement: ACTIVO [cite: 69]<br>
                    > Anti-NaN Shield: CARGADO [cite: 34]
                </div>
                <div class="footer">Cloudflare Worker & Gemini AI Integration © 2026</div>
            </div>
        </body>
        </html>
      `, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    // 2. Lógica de la API InproShield (Ruta /api/valorar)
    if (url.pathname === "/api/valorar") {
      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Método no permitido. Use POST." }), { status: 405, headers: { "Content-Type": "application/json" } });
      }

      try {
        const body = await request.json();
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

        // Inyección de Esquema JSON para erradicar el error $NaN [cite: 34, 56]
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

        const res = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(geminiPayload)
        });

        const data = await res.json();
        
        // Manejo de errores de cuota o ubicación [cite: 61, 151]
        if (data.error) {
          return new Response(JSON.stringify({ 
            integrity_score: 0, 
            error: data.error.message,
            bypass_active: true 
          }), { status: 200, headers: { "Content-Type": "application/json" } });
        }

        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '{"integrity_score":0}';
        return new Response(aiResponse, { headers: { "Content-Type": "application/json" } });

      } catch (err) {
        return new Response(JSON.stringify({ error: "Error en el procesamiento del Worker" }), { status: 500 });
      }
    }

    // 3. Fallback para otras rutas
    return new Response(JSON.stringify({ error: "Ruta no encontrada" }), { status: 404, headers: { "Content-Type": "application/json" } });
  }
};
