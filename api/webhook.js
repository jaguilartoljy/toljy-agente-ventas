async function getOdooSession() {
  const url = process.env.ODOO_URL;
  const db = process.env.ODOO_DB;
  const apiKey = process.env.ODOO_API_KEY;

  const response = await fetch(`${url}/web/session/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', method: 'call', id: 1,
      params: {
        db: db,
        login: 'jaguilar@toljy.com',
        password: apiKey
      }
    })
  });
  const data = await response.json();
  return data.result?.session_id || null;
}

async function crearLeadOdoo(datos) {
  const url = process.env.ODOO_URL;
  const db = process.env.ODOO_DB;
  const apiKey = process.env.ODOO_API_KEY;

  try {
    const response = await fetch(`${url}/web/dataset/call_kw`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        jsonrpc: '2.0', method: 'call', id: 1,
        params: {
          model: 'crm.lead',
          method: 'create',
          args: [{
            name: `Photon - ${datos.nombre} - ${datos.empresa || 'Sin empresa'}`,
            contact_name: datos.nombre,
            partner_name: datos.empresa,
            email_from: datos.email || '',
            phone: datos.telefono || '',
            description: `Tipo: ${datos.tipo || ''}\nZona: ${datos.zona || ''}\nResumen: ${datos.resumen || ''}`,
          }],
          kwargs: { context: { lang: 'es_MX' } }
        }
      })
    });
    const data = await response.json();
    console.log('Lead Odoo:', JSON.stringify(data));
    return data.result;
  } catch (e) {
    console.error('Error CRM:', e);
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, historial, datosCliente } = req.body;
    if (!message) return res.status(400).json({ error: 'No message provided' });

    // Si tenemos datos suficientes del cliente, crear lead en Odoo
    let leadCreado = false;
    if (datosCliente && datosCliente.nombre && (datosCliente.telefono || datosCliente.email)) {
      const leadId = await crearLeadOdoo(datosCliente);
      leadCreado = !!leadId;
    }

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

REGLAS DE ENRUTAMIENTO (menciónalas cuando sea relevante):
- Cliente necesita cálculo de iluminación o diseño de proyecto → "Te voy a conectar con nuestro equipo de proyectos de iluminación"
- Cliente es gobierno/municipio → "Te comunicaré con nuestro equipo especializado en sector gobierno"
- Cliente final nuevo → "Con gusto te asignamos un ejecutivo de cuenta"
- Distribuidor o cliente conocido → "Te conectamos con tu ejecutivo de cuenta"

IMPORTANTE:
- Nunca menciones nombres internos del equipo
- Si el cliente ya dio su nombre, NO lo vuelvas a pedir
- Usa siempre el historial de conversación para no repetir preguntas

FLUJO DE CAPTURA (hazlo natural en la conversación):
1. Saluda y entiende la necesidad
2. Identifica: ¿es proyecto, gobierno, distribuidor o cliente final?
3. Pregunta nombre, empresa y zona (occidente/centro/sur)
4. Cuando tengas nombre + teléfono o email → responde con JSON al final:
   [LEAD:{"nombre":"...","empresa":"...","telefono":"...","email":"...","tipo":"proyecto|gobierno|distribuidor|cliente_final","zona":"occidente|centro|sur","resumen":"..."}]

PERSONALIDAD:
- Español mexicano natural, amable y experto
- Califica prospectos: tipo proyecto, m2, altura, zona, presupuesto
- No inventes precios, ofrece cotización formal
- Fichas técnicas en toljy.com/descargables`,
        messages: historial || [{ role: 'user', content: message }]
      })
    });

    const data = await response.json();
    let reply = data.content?.[0]?.text || 'Lo siento, hubo un error.';

    // Extraer datos del lead si Photon los capturó
    let leadData = null;
    const leadMatch = reply.match(/\[LEAD:(.*?)\]/s);
    if (leadMatch) {
      try {
        leadData = JSON.parse(leadMatch[1]);
        reply = reply.replace(/\[LEAD:.*?\]/s, '').trim();
        // Crear lead en Odoo
        await crearLeadOdoo(leadData);
      } catch(e) {}
    }

    return res.status(200).json({ reply, leadData });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
