export async function crearLeadOdoo(datos) {
  try {
    const url = process.env.ODOO_URL;
    const apiKey = process.env.ODOO_API_KEY;
    const db = process.env.ODOO_DB;

    const response = await fetch(`${url}/web/dataset/call_kw/crm.lead/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Odoo-Dbname': db
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        id: 1,
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

    const text = await response.text();
    console.log('Odoo raw response:', text.substring(0, 300));
    
    const data = JSON.parse(text);
    console.log('Lead resultado:', JSON.stringify(data));
    return data.result || null;

  } catch(e) {
    console.error('Error CRM:', e.message);
    return null;
  }
}

export async function buscarContacto(nombre, empresa) {
  return [];
}
