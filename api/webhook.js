import { buscarProducto } from './productos.js';
import { crearLeadOdoo } from './odoo.js';

const SYSTEM_PROMPT = `Eres Photon, agente de ventas virtual de Toljy (Industrias Toljy), fabricante mexicano de equipos de iluminación LED profesional.

CONTACTO: comercial@toljy.com | Tel: 55 5565 1617 | WhatsApp: 56 1721 2016

LÍNEAS DE PRODUCTOS: (todas igual de importantes, somos una fabrica de luminarios, postes de alumbrado, y mobiliario urbano, hasta hacemos custom made )
- Alumbrado Público: Zulu, Eco, Ovniled, Ovniflat, Endeavor, Lima, Lima Slim, Delta, Ovnidelta, Zulu HG
- Comercial: Proyector Alfa, DLT, LMX, Wallpack-S, Seguidor de Reclusorios
- Arquitectónico: Puntas de Poste, Postes con Luz
- Estructura: Bases, Brazos, Rizos, Postes, Mobiliario Urbano
- Fichas técnicas: toljy.com/descargables

REGLAS DE ENRUTAMIENTO:
- Necesita cálculo o diseño de proyecto → "Te conectamos con nuestro equipo de proyectos de iluminación"
- Gobierno o municipio → "Te comunicamos con nuestro equipo de sector gobierno"
- Cliente final nuevo → "Te asignamos un ejecutivo de cuenta"
- Distribuidor o cliente conocido → "Te conectamos con tu ejecutivo de cuenta"

INICIO DE CONVERSACIÓN:
- Saluda y pide nombre y empresa antes de cualquier otra cosa
- Consigue teléfono o correo de forma natural durante la conversación
- No hagas todas las preguntas de golpe, una a la vez

IMPORTANTE:
- Nunca menciones nombres internos del equipo
- Si el cliente ya dio su nombre NO lo vuelvas a pedir
- No inventes precios, ofrece cotización formal
- Cuando tengas nombre + empresa + teléfono o correo incluye al final:
[LEAD:{"nombre":"...","empresa":"...","telefono":"...","email":"...","tipo":"proyecto|gobierno|distribuidor|cliente_final","zona":"occidente|centro|sur","resumen":"..."}]`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, historial } = req.body;
    if (!message) return res.status(400).json({ error: 'No message provided' });

    // Buscar producto dinámicamente en toljy.com
    const contextoProducto = await buscarProducto(message);

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
        system: SYSTEM_PROMPT + contextoProducto,
        messages: historial || [{ role: 'user', content: message }]
      })
    });

    const data = await response.json();
    let reply = data.content?.[0]?.text || 'Lo siento, hubo un error.';

    // Extraer y crear lead si Photon capturó datos
    const leadMatch = reply.match(/\[LEAD:(.*?)\]/s);
    if (leadMatch) {
      try {
        const leadData = JSON.parse(leadMatch[1]);
        reply = reply.replace(/\[LEAD:.*?\]/s, '').trim();
        await crearLeadOdoo(leadData);
      } catch(e) {}
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
