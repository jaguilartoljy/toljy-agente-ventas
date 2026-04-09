export async function crearLeadOdoo(datos) {
  try {
    const url = process.env.ODOO_URL;
    const apiKey = process.env.ODOO_API_KEY;
    const db = process.env.ODOO_DB;

    // Odoo.sh usa JSON-RPC con API key como password y empty user
    const response = await fetch(`${url}/web/dataset/call_kw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
            description: `Tipo: ${datos.tipo || ''}\nZona: ${datos.zona || ''}\nResumen: ${datos.resumen || ''}\n\nCapturado por Photon IA`,
          }],
          kwargs: {
            context: {
              lang: 'es_MX',
              allowed_company_ids: [1]
            }
          }
        }
      }),
      // Autenticación con API key via Basic Auth
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${apiKey}:`).toString('base64')
      }
    });

    const data = await response.json();
    console.log('Lead Odoo resultado:', JSON.stringify(data));
    return data.result;

  } catch(e) {
    console.error('Error CRM:', e.message);
    return null;
  }
}

export async function buscarContacto(nombre, empresa) {
  try {
    const url = process.env.ODOO_URL;
    const apiKey = process.env.ODOO_API_KEY;

    const response = await fetch(`${url}/web/dataset/call_kw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${apiKey}:`).toString('base64')
      },
      body: JSON.stringify({
        jsonrpc: '2.0', method: 'call', id: 1,
        params: {
          model: 'res.partner',
          method: 'search_read',
          args: [[['name', 'ilike', empresa || nombre]]],
          kwargs: { fields: ['name', 'email', 'phone', 'user_id'], limit: 3 }
        }
      })
    });
    const data = await response.json();
    return data.result || [];
  } catch(e) {
    return [];
  }
}
