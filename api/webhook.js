async function buscarProductoToljy(nombreProducto) {
  const productos = {
    'zulu': '/zulu', 'eco': '/eco', 'ovniled': '/ovniled',
    'ovniflat': '/ovniflat', 'endeavor': '/endeavor', 'lima': '/lima',
    'delta': '/delta', 'ovnidelta': '/ovnidelta', 'lima slim': '/lima-slim',
    'zulu hg': '/hg', 'proyector alfa': '/proyector-alfa', 'alfa': '/proyector-alfa',
    'dlt': '/dlt', 'lmx': '/lmx', 'wallpack': '/wallpack-s'
  };

  const key = Object.keys(productos).find(k => 
    nombreProducto.toLowerCase().includes(k)
  );
  
  if (!key) return null;

  try {
    const response = await fetch(`https://www.toljy.com${productos[key]}`);
    const html = await response.text();
    // Extraer texto relevante del HTML
    const texto = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .substring(0, 3000);
    return { producto: key, url: `https://www.toljy.com${productos[key]}`, info: texto };
  } catch(e) {
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
    const { message, historial } = req.body;
    if (!message) return res.status(400).json({ error: 'No message provided' });

    // Buscar si mencionan un producto
    const infoProducto = await buscarProductoToljy(message);
    
    let contextoProducto = '';
    if (infoProducto) {
      contextoProducto = `\n\nINFO ACTUALIZADA DEL PRODUCTO "${infoProducto.producto.toUpperCase()}" (toljy.com):\n${infoProducto.info}\nURL ficha: ${infoProducto.url}`;
    }

    const mensajes = historial || [{ role: 'user', content: message }];

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

LÍNEAS DE PRODUCTOS:
- Alumbrado Público: Zulu, Eco, Ovniled, Ovniflat, Endeavor, Lima, Lima Slim, Delta, Ovnidelta, Zulu HG
- Comercial: Proyector Alfa, DLT, LMX, Wallpack-S, Seguidor de Reclusorios
- Arquitectónico: Puntas de Poste, Postes con Luz
- Estructura: Bases, Brazos, Rizos, Postes, Mobiliario Urbano
- Fichas técnicas y fotometrías: toljy.com/descargables

REGLAS DE ENRUTAMIENTO:
- Necesita cálculo/diseño de proyecto → "Te conectamos con nuestro equipo de proyectos de iluminación"
- Gobierno/municipio → "Te comunicamos con nuestro equipo especializado en sector gobierno"  
- Cliente final nuevo → "Te asignamos un ejecutivo de cuenta personalizado"
- Distribuidor/cliente conocido → "Te conectamos con tu ejecutivo de cuenta"

INICIO DE CONVERSACIÓN:
- Siempre pide nombre y empresa antes de cualquier otra cosa
- De forma natural consigue teléfono o correo durante la conversación
- No hagas todas las preguntas de golpe

IMPORTANTE:
- Nunca menciones nombres internos del equipo
- Si el cliente ya dio su nombre NO lo vuelvas a pedir
- Cuando tengas nombre + empresa + (tel o correo) incluye al final: [LEAD:{"nombre":"...","empresa":"...","telefono":"...","email":"...","tipo":"...","zona":"...","resumen":"..."}]
- No inventes precios, ofrece cotización formal${contextoProducto}`,
        messages: mensajes
      })
    });

    const data = await response.json();
    let reply = data.content?.[0]?.text || 'Lo siento, hubo un error.';

    // Extraer y crear lead si hay datos
    const leadMatch = reply.match(/\[LEAD:(.*?)\]/s);
    if (leadMatch) {
      try {
        const leadData = JSON.parse(leadMatch[1]);
        reply = reply.replace(/\[LEAD:
