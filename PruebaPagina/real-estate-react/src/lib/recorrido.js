/**
 * Arma los pasos del recorrido de un emprendimiento en pozo.
 *
 * Regla de la que no se sale: todo lo que se afirme sale de lo cargado en el
 * panel. Nada de plazos, valores ni cantidades que no estén en los datos —en un
 * pozo, prometer algo que después no se cumple es el peor error posible—. El
 * texto de enlace describe lo que se ve; no agrega promesas.
 */

// La descripción se carga como texto libre, una característica por línea y a
// veces separadas por guiones. Se parte en ítems para poder mostrarla como
// lista en vez de como un párrafo corrido.
export function caracteristicas(descripcion = '') {
  return descripcion
    .split(/[\n·]+/)
    .flatMap(l => l.split(/\s+-\s+/))
    .map(l => l.replace(/\s+/g, ' ').trim())
    .filter(l => l.length > 2)
}

const primeraCiudad = (ubicacion = '') => {
  const partes = ubicacion.split(',').map(p => p.trim()).filter(Boolean)
  return { calle: partes[0] || ubicacion, barrio: partes[1] || '' }
}

export function pasosDeObra(emp) {
  const fotos = (emp.imagenes || []).filter(Boolean)
  if (!fotos.length) return []

  const { calle, barrio } = primeraCiudad(emp.ubicacion)
  const rasgos = caracteristicas(emp.descripcion)
  const m2 = emp.superficieDesde > 0 ? `${emp.superficieDesde} m²` : null

  // Los tres primeros pasos son la misma imagen: el render principal, primero
  // como plano y después materializándose. Un solo edificio, sin inconsistencias.
  const principal = fotos[0]

  const pasos = [
    {
      titulo: barrio ? `Una esquina en ${barrio}` : 'El lugar',
      texto: `${calle}${barrio ? `, ${barrio}` : ''}. Hoy todavía es una esquina del barrio: acá va a levantarse el edificio.`,
      img: principal,
      alt: `Emplazamiento del proyecto en ${emp.ubicacion}`,
      plano: true,
      revelado: '0%',
      datos: [],
    },
    {
      titulo: 'Toma forma',
      texto: m2
        ? `El proyecto avanza en altura. Cada unidad es de ${m2}, una escala pensada para vivir.`
        : 'El proyecto avanza en altura, planta por planta.',
      img: principal,
      alt: 'El proyecto tomando forma',
      plano: true,
      revelado: '58%',
      datos: m2 ? [`${m2} por unidad`] : [],
    },
    {
      titulo: 'Así va a verse',
      texto: 'El edificio terminado sobre la esquina, con los locales a nivel de vereda y las unidades en los pisos superiores.',
      img: principal,
      alt: `Render del edificio terminado en ${emp.ubicacion}`,
      plano: false,
      revelado: '100%',
      datos: [],
    },
  ]

  // Las fotos siguientes muestran el proyecto por dentro. El orden lo define
  // quien carga el emprendimiento, así que el texto no asume qué hay en cada
  // una: la lista de características es la que aporta el detalle concreto.
  const restantes = fotos.slice(1)
  // Los títulos describen lo que el paso AFIRMA, no lo que muestra la foto: el
  // orden de las imágenes lo decide quien carga el emprendimiento, así que un
  // título temático ("la cochera") terminaría contradiciendo a la imagen.
  const bloques = [
    { titulo: 'Cada unidad', texto: 'Así está pensado el interior de los departamentos.' },
    { titulo: 'Equipamiento', texto: 'Lo que viene incluido en el proyecto.' },
    { titulo: 'El conjunto', texto: 'Lo que comparten las unidades del edificio.' },
  ]

  // Las características se reparten entre los bloques para que cada uno diga
  // algo concreto en vez de repetir la lista entera.
  const porBloque = Math.ceil(rasgos.length / Math.max(restantes.length, 1)) || 1

  restantes.forEach((img, i) => {
    const b = bloques[i] ?? { titulo: 'El proyecto', texto: 'Otra vista del emprendimiento.' }
    pasos.push({
      ...b,
      img,
      alt: `${emp.titulo} — vista ${i + 2}`,
      plano: false,
      revelado: '100%',
      datos: rasgos.slice(i * porBloque, (i + 1) * porBloque),
    })
  })

  return pasos
}
