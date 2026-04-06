export async function crearLeadOdoo(datos) {
  try {
    const response = await fetch(`${process.env.ODOO_URL}/web/dataset/call_kw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ODOO_API_KEY}`
      },
      body: JSON.stringify({
        jsonrpc: '2.0', method: 'call', id: 1,
        params: {
          model: 'crm.lead',
          method: 'create',
          args: [{
            name: `Photon - ${datos.nombre} - ${datos.empresa || 'Sin empresa'}`,
            contact_name: datos.nombre,
            partner_name: datos.empresa || '',
            email_from: datos.email || '',
            phone: datos.telefono || '',
            description: `Tipo: ${datos.tipo || ''}\nZona: ${datos.zona || ''}\nResumen: ${datos.resumen || ''}`
          }],
          kwargs: { context: { lang: 'es_MX' } }
        }
      })
    });
    const data = await response.json();
    console.log('Lead creado:', JSON.stringify(data));
    return data.result;
  } catch(e) {
    console.error('Error CRM:', e);
    return null;
  }
}

export async function buscarContacto(nombre, empresa) {
  try {
    const response = await fetch(`${process.env.ODOO_URL}/web/dataset/call_kw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ODOO_API_KEY}`
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
