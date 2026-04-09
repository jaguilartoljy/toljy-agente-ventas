export async function crearLeadOdoo(datos) {
  try {
    const url = process.env.ODOO_URL;
    const apiKey = process.env.ODOO_API_KEY;

    const response = await fetch(`${url}/api/crm.lead`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        name: `Photon - ${datos.nombre} - ${datos.empresa || 'Sin empresa'}`,
        contact_name: datos.nombre,
        partner_name: datos.empresa || '',
        email_from: datos.email || '',
        phone: datos.telefono || '',
        description: `Tipo: ${datos.tipo || ''}\nZona: ${datos.zona || ''}\nResumen: ${datos.resumen || ''}\n\n📍 Capturado por Photon IA`
      })
    });

    const data = await response.json();
    console.log('Lead resultado:', JSON.stringify(data));
    return data.id || null;

  } catch(e) {
    console.error('Error CRM:', e.message);
    return null;
  }
}

export async function buscarContacto(nombre, empresa) {
  return [];
}
