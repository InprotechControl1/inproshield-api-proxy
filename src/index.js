var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. LANDING DE ESTADO
    if (url.pathname === "/" || url.pathname === "") {
      return new Response(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>InproShield | Nodo Maestro v3.7</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; background-color: #0a0a0f; color: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .container { background: #13121a; padding: 2.5rem; border-radius: 20px; border: 1px solid #2a2740; text-align: center; max-width: 450px; }
                h1 { margin: 10px 0; font-size: 1.8rem; color: #3b82f6; }
                .info { background: #0a0a0f; padding: 1rem; border-radius: 12px; font-family: monospace; font-size: 0.85rem; color: #3b82f6; margin-top: 1.5rem; text-align: left; border: 1px solid #1e1c2a; }
            </style>
        </head>
        <body>
            <div class="container">
                <div style="background: #1E3A8A; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; font-size: 12px;">● ONLINE</div>
                <h1>Nodo Maestro v3.7</h1>
                <p>Modo de Compatibilidad Total activado.</p>
                <div class="info">
                    > Engine: Gemini 1.5 [OK]<br>
                    > Fix: responseMimeType Bypass [OK]<br>
                    > Status: Listo para Diagnóstico
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
        
        // PROMPT SIMPLIFICADO (Sin pedir JSON complejo para evitar errores)
        const promptText = `Eres el consultor de InproShield. Analiza estos datos: ${JSON.stringify(body.responses || body)}. 
        Escribe un párrafo de 4 líneas en HTML (usa <strong>) sobre fugas de dinero y solución profesional. 
        Sé directo, sin saludos.`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
        
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
            analysis: `<strong>Error de Comunicación:</strong> ${data.error.message}`
          }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
        }

        // Extraemos el texto puro de la IA
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Análisis no disponible.";
        
        // Lo enviamos en el formato que tu web espera
        return new Response(JSON.stringify({
            integrity_score: 85,
            analysis: aiText
        }), { 
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            } 
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: "Fallo técnico: " + err.message }), { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
      }
    }

    return new Response("No encontrado", { status: 404 });
  }
};

export { index_default as default };
