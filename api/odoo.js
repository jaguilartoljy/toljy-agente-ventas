export async function crearLeadOdoo(datos) {
  try {
    const url = process.env.ODOO_URL;
    const apiKey = process.env.ODOO_API_KEY;
    const db = process.env.ODOO_DB;

    // Odoo.sh API key usa /web/dataset/call_kw con autenticación diferente
    // Primero hacemos login con la API key
    const loginResp = await fetch(`${url}/web/session/authenticate`, {
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

    const loginData = await loginResp.json();
    console.log('Login result:', JSON.stringify(loginData?.result?.uid));

    if (!loginData?.result?.uid) {
      console.error('Login fallido:', JSON.stringify(loginData?.error));
      return null;
    }

    // Extraer cookies de sesión
    const cookies = loginResp.headers.get('set-cookie');

    // Crear lead con la sesión activa
    const leadResp = await fetch(`${url}/web/dataset/call_kw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      },
      body: JSON.stringify({
        jsonrpc: '2.0', method: 'call', id: 2,
        params: {
          model: 'crm.lead',
          method: 'create',
          args: [{
            name: `Photon - ${datos.nombre} - ${datos.empresa || 'Sin empresa'}`,
            contact_name: datos.nombre,
            partner_name: datos.empresa || '',
            email_from: datos.email || '',
            phone: datos.telefono || '',
            description: `Tipo: ${datos.tipo || ''}\nZona: ${datos.zona || ''}\nResumen: ${datos.resumen || ''}\n\n📍 Capturado por Photon IA`
          }],
          kwargs: { context: { lang: 'es_MX' } }
        }
      })
    });

    const leadData = await leadResp.json();
    console.log('Lead creado:', JSON.stringify(leadData));
    return leadData.result;

  } catch(e) {
    console.error('Error CRM:', e.message);
    return null;
  }
}

export async function buscarContacto(nombre, empresa) {
  return [];
}
