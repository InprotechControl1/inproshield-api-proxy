var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. LANDING DE ESTADO (Artillería Pesada)
    if (url.pathname === "/" || url.pathname === "") {
      return new Response(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>InproShield | Nodo Maestro v4.0</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; background: #0a0a0f; color: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .container { background: #13121a; padding: 2.5rem; border-radius: 20px; border: 1px solid #dc2626; text-align: center; max-width: 450px; box-shadow: 0 0 30px rgba(220, 38, 38, 0.1); }
                h1 { margin: 10px 0; font-size: 1.8rem; color: #ef4444; }
                .info { background: #0a0a0f; padding: 1rem; border-radius: 12px; font-family: monospace; font-size: 0.85rem; color: #ef4444; margin-top: 1.5rem; text-align: left; border: 1px solid #450a0a; }
            </style>
        </head>
        <body>
            <div class="container">
                <div style="background: #dc2626; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; font-size: 12px; font-weight: bold;">● ARTILLERÍA PESADA ACTIVA</div>
                <h1>Nodo Maestro v4.0</h1>
                <p>Bypass de alta prioridad. Motor PRO Inmobiliario conectado.</p>
                <div class="info">
                    > Engine: Gemini 1.5 PRO [MAX POWER]<br>
                    > Endpoint: v1beta/PRO [CONECTADO]<br>
                    > Status: Operativo
                </div>
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

      try {
        const body = await request.json();
        
        const promptText = `Eres el Director de Estrategia Inmobiliaria de InproShield. Analiza estos datos: ${JSON.stringify(body.responses || body)}. 
        Genera un diagnóstico contundente de 4 líneas en HTML (usa <strong>). Detecta la fuga de dinero exacta y da la solución técnica. No uses saludos.`;

        // EL CAMBIO MAESTRO: USAMOS EL MODELO "PRO"
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${env.GEMINI_API_KEY}`;
        
        const res = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
          })
        });

        const data = await res.json();

        if (data.error) {
          return new Response(JSON.stringify({
            integrity_score: 0,
            analysis: `<strong>Error de Motor Pro:</strong> ${data.error.message}`
          }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
        }

        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "El análisis Pro no pudo completarse.";
        
        return new Response(JSON.stringify({
            integrity_score: 99,
            analysis: aiText
        }), { 
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            } 
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: "Fallo crítico: " + err.message }), { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
      }
    }

    return new Response("Ruta no encontrada", { status: 404 });
  }
};

export { index_default as default };
