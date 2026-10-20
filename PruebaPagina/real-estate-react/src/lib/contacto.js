// Los números de contacto viven acá y en ningún otro lado. Antes estaban
// repetidos en cinco archivos, con dos valores distintos y uno inventado
// (11 1234-5678 en el detalle de propiedad).

export const WHATSAPP = {
  general:  { numero: '5491154794749', label: '+54 9 11 5479-4749', titulo: 'Consultas generales',
              desc: 'Compra, venta, tasaciones e inversión' },
  alquiler: { numero: '5491154794715', label: '+54 9 11 5479-4715', titulo: 'Alquileres',
              desc: 'Consultas sobre propiedades en alquiler' },
}

// Arma el link de WhatsApp. `tipo` es 'general' o 'alquiler'.
export function waLink(tipo = 'general', texto) {
  const { numero } = WHATSAPP[tipo] || WHATSAPP.general
  return `https://wa.me/${numero}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`
}

// Una propiedad en alquiler va al número de alquileres; todo lo demás, al general.
export const waParaOperacion = (operacion) =>
  operacion === 'alquiler' ? 'alquiler' : 'general'
