var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. LANDING DE ESTADO (Para verificar la versión)
    if (url.pathname === "/" || url.pathname === "") {
      return new Response(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>InproShield | Nodo Maestro v3.6</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; background-color: #0a0a0f; color: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .container { background: #13121a; padding: 2.5rem; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid #2a2740; text-align: center; max-width: 450px; }
                .status-badge { background: #1E3A8A; color: white; padding: 0.5rem 1rem; border-radius: 99px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; margin-bottom: 1rem; display: inline-block; }
                h1 { margin: 10px 0; font-size: 1.8rem; color: #3b82f6; }
                .info { background: #0a0a0f; padding: 1rem; border-radius: 12px; font-family: monospace; font-size: 0.85rem; color: #3b82f6; margin-top: 1.5rem; text-align: left; border: 1px solid #1e1c2a; }
                .footer { margin-top: 2rem; font-size: 0.7rem; color: #475569; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="status-badge">● InproShield Online</div>
                <h1>Nodo Maestro v3.6</h1>
                <p>Bypass geográfico Miami-Venezuela activo. Inteligencia Inmobiliaria sincronizada.</p>
                <div class="info">
                    > Versión: 3.6 [OK]<br>
                    > Región: Global Bypass [OK]<br>
                    > Status: Esperando peticiones...
                </div>
                <div class="footer">Infraestructura Soberana © 2026</div>
            </div>
        </body>
        </html>
      `, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    // 2. PROCESAMIENTO DE LA API
    if (url.pathname === "/api/valorar") {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          }
        });
      }

      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "POST requerido" }), { status: 405 });
      }

      try {
        const body = await request.json();
        
        const promptText = `Actúa como consultor senior de InproShield. Analiza estos datos: ${JSON.stringify(body.responses || body)}. 
        Responde ÚNICAMENTE un JSON con: 
        "integrity_score": (número), 
        "analysis": (párrafo HTML con <strong> resaltando fugas de dinero).`;

        // URL ESTABLE v1
        const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
        
        const res = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        const data = await res.json();

        // MANEJO DE ERROR DETALLADO PARA EL DUEÑO (RAINIER)
        if (data.error) {
          return new Response(JSON.stringify({
            integrity_score: 0,
            analysis: `<strong>Error de IA:</strong> ${data.error.message}. <br><em>Verifica la API KEY en Cloudflare.</em>`
          }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
        }

        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '{"integrity_score":0, "analysis": "Sin respuesta de IA"}';
        
        return new Response(aiResponse, { 
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            } 
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: "Error interno: " + err.message }), { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
      }
    }

    return new Response(JSON.stringify({ error: "No encontrado" }), { status: 404 });
  }
};

export { index_default as default };
