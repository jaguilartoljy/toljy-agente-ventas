export async function crearLeadOdoo(datos) {
  try {
    const url = process.env.ODOO_URL;
    const apiKey = process.env.ODOO_API_KEY;
    const db = process.env.ODOO_DB;

    const xmlAuthenticate = `<?xml version="1.0"?>
<methodCall>
  <methodName>authenticate</methodName>
  <params>
    <param><value><string>${db}</string></value></param>
    <param><value><string>jaguilar@toljy.com</string></value></param>
    <param><value><string>${apiKey}</string></value></param>
    <param><value><struct></struct></value></param>
  </params>
</methodCall>`;

    const authResp = await fetch(`${url}/xmlrpc/2/common`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: xmlAuthenticate
    });

    const authText = await authResp.text();
    const uidMatch = authText.match(/<int>(\d+)<\/int>/);
    if (!uidMatch) {
      console.error('Auth fallida:', authText.substring(0, 300));
      return null;
    }
    const uid = uidMatch[1];
    console.log('UID obtenido:', uid);

    const xmlCreate = `<?xml version="1.0"?>
<methodCall>
  <methodName>execute_kw</methodName>
  <params>
    <param><value><string>${db}</string></value></param>
    <param><value><int>${uid}</int></value></param>
    <param><value><string>${apiKey}</string></value></param>
    <param><value><string>crm.lead</string></value></param>
    <param><value><string>create</string></value></param>
    <param><value><array><data>
      <value><struct>
        <member><name>name</name><value><string>Photon - ${datos.nombre} - ${datos.empresa || 'Sin empresa'}</string></value></member>
        <member><name>contact_name</name><value><string>${datos.nombre}</string></value></member>
        <member><name>partner_name</name><value><string>${datos.empresa || ''}</string></value></member>
        <member><name>email_from</name><value><string>${datos.email || ''}</string></value></member>
        <member><name>phone</name><value><string>${datos.telefono || ''}</string></value></member>
        <member><name>description</name><value><string>Tipo: ${datos.tipo || ''} | Zona: ${datos.zona || ''} | ${datos.resumen || ''} | Capturado por Photon IA</string></value></member>
        <member><name>tag_ids</name><value><array><data>
          <value><array><data>
            <value><int>4</int></value>
            <value><int>13</int></value>
            <value><int>0</int></value>
          </data></array></value>
        </data></array></value></member>
      </struct></value>
    </data></array></value></param>
    <param><value><struct></struct></value></param>
  </params>
</methodCall>`;

    const createResp = await fetch(`${url}/xmlrpc/2/object`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: xmlCreate
    });

    const createText = await createResp.text();
    console.log('Create response:', createText.substring(0, 200));

    const idMatch = createText.match(/<int>(\d+)<\/int>/);
    if (idMatch) {
      console.log('✅ Lead creado con ID:', idMatch[1]);
      return idMatch[1];
    }

    return null;

  } catch(e) {
    console.error('Error CRM:', e.message);
    return null;
  }
}

export async function buscarContacto(nombre, empresa) {
  return [];
}
