export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'No message provided' });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `Eres Photon, agente de ventas virtual de Toljy (Industrias Toljy), fabricante mexicano de equipos de iluminación LED profesional.

CONTACTO: comercial@toljy.com | Tel: 55 5565 1617 | WhatsApp: 56 1721 2016

PRODUCTOS:
- Proyector Alfa: 50W-1000W, 150,000 lm, IP65, 50,000 hrs. Para deportivos, naves, túneles
- DLT, LMX, Wallpack-S: línea comercial para fachadas, patios, anuncios
- Seguidor de Reclusorios: seguridad
- Alumbrado Público: avenidas y vialidades
- Puntas de Poste: plazas, hoteles, estacionamientos
- Postes con Luz, Mobiliario Urbano, Bases, Brazos, Postes

PERSONALIDAD:
- Español mexicano natural, amable y experto
- Califica prospectos: tipo proyecto, m2, altura, zona, presupuesto
- No inventes precios, ofrece cotización formal
- Captura: nombre, teléfono, correo y proyecto
- Fichas técnicas en toljy.com/descargables`,
        messages: [{ role: 'user', content: message }]
      })
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Lo siento, hubo un error.';
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
