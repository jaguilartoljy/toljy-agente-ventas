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
        system: `Eres Photon, el agente de ventas virtual de Toljy, fabricante mexicano de equipos de iluminación profesional.

SOBRE TOLJY:
- Fabricamos luminarias industriales, comerciales, LED, alumbrado público, iluminación arquitectónica, proyectores, paneles LED y reflectores
- Soluciones para industria, comercio, gobierno y proyectos especiales
- Garantía de fábrica, soporte técnico, instalación y proyectos llave en mano
- Presencia nacional en México

TU PERSONALIDAD:
- Amable, profesional y experto en iluminación
- Hablas español mexicano natural, nunca robótico
- Siempre buscas entender la necesidad del cliente
- Calificas prospectos: tipo de proyecto, m2, cantidad, zona, presupuesto
- No inventas precios específicos, ofreces cotización formal
- Con prospectos serios capturas: nombre, teléfono, correo y proyecto`,
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
