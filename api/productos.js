export async function buscarProducto(mensaje) {
  // Extraer posible nombre de producto del mensaje
  // Limpiamos el mensaje y sacamos palabras clave
  const palabrasComunes = ['necesito', 'quiero', 'tienen', 'tienes', 'el', 'la', 'un', 'una', 
    'para', 'con', 'que', 'me', 'puedes', 'información', 'sobre', 'del', 'de', 'los', 'las',
    'hay', 'busco', 'dame', 'dime', 'cual', 'cuál', 'como', 'cómo', 'producto', 'modelo',
    'luminario', 'luminaria', 'equipo', 'luz', 'iluminación', 'hola', 'buenas', 'buen'];

  const palabras = mensaje.toLowerCase()
    .replace(/[¿?¡!.,]/g, '')
    .split(' ')
    .filter(p => p.length > 2 && !palabrasComunes.includes(p));

  // Intentar cada palabra como posible producto
  for (const palabra of palabras) {
    try {
      const url = `https://www.toljy.com/${palabra}`;
      const response = await fetch(url, { redirect: 'follow' });
      
      // Si la página existe y no es un 404
      if (response.ok && response.url.includes(palabra)) {
        const html = await response.text();
        
        // Verificar que es una página de producto real
        if (!html.includes('404') && html.includes('Toljy')) {
          const texto = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 2000);
          
          return `\n\nINFO REAL DE TOLJY.COM sobre "${palabra.toUpperCase()}":\n${texto}\nVer ficha completa: ${url}`;
        }
      }
    } catch(e) {
      continue;
    }
  }
  return '';
}
