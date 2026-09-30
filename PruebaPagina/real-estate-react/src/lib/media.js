// Punto único de traducción entre lo que hay guardado en Firestore y lo que
// necesita el DOM. Ningún componente debe construir una URL de media a mano.
//
// En Firestore guardamos el secure_url CANÓNICO de Cloudinary, sin ninguna
// transformación embebida. Las transformaciones se inyectan acá, al renderizar.
// Así cambiar un tamaño es editar una constante, no migrar la base.

const CLD_RE = /^https?:\/\/res\.cloudinary\.com\//i
const EXT_VIDEO_RE = /\.(mov|m4v|avi|mkv|3gp|webm|mpg|mpeg|wmv|flv|mp4)$/i

// Inyecta un segmento de transformación después de /upload/.
// Cualquier cosa que no sea una URL de Cloudinary (Firebase Storage viejo,
// Unsplash pegado a mano, undefined) pasa intacta. Esa es la retrocompatibilidad.
export function cldUrl(url, transform) {
  if (typeof url !== 'string' || !transform || !CLD_RE.test(url)) return url
  const i = url.indexOf('/upload/')
  if (i === -1) return url
  return url.slice(0, i + 8) + transform + '/' + url.slice(i + 8)
}

// f_auto sirve AVIF/WebP según el navegador; q_auto ajusta la compresión por contenido.
// c_fill va sin g_auto a propósito: el recorte con IA puede dar 400 en cuentas free.
export const imgMini    = (url) => cldUrl(url, 'f_auto,q_auto,w_160,h_110,c_fill')
export const imgPreview = (url) => cldUrl(url, 'f_auto,q_auto,w_200,h_140,c_fill')
export const imgCard    = (url) => cldUrl(url, 'f_auto,q_auto,w_800,h_560,c_fill')
export const imgFull    = (url) => cldUrl(url, 'f_auto,q_auto,w_1920,c_limit') // c_limit solo achica

// Forzar .mp4 es lo que hace que un .MOV/HEVC de iPhone se reproduzca en Chrome
// y Firefox: Cloudinary transcodifica on-the-fly, del lado del servidor.
export function videoSrc(url) {
  if (typeof url !== 'string' || !CLD_RE.test(url)) return url
  return cldUrl(url.replace(EXT_VIDEO_RE, '.mp4'), 'q_auto')
}

// Primer frame como poster. Devuelve undefined si no es de Cloudinary,
// para no poner un poster roto en videos legacy.
export function videoPoster(url) {
  if (typeof url !== 'string' || !CLD_RE.test(url)) return undefined
  return cldUrl(url.replace(EXT_VIDEO_RE, '.jpg'), 'so_0,f_auto,q_auto,w_800,c_fill')
}

const YT_RE = /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i
const VIMEO_RE = /vimeo\.com\/(?:[^/]+\/)*?(\d{6,})(?:\/([A-Za-z0-9]+))?/i

// Decide cómo reproducir una URL. El tipo NO se guarda en el dato: se deriva
// del host, así no puede desincronizarse de la URL que tiene al lado.
export function parseVideoUrl(url) {
  if (typeof url !== 'string' || !url.trim()) {
    return { tipo: 'archivo', id: null, embedUrl: null }
  }

  const yt = url.match(YT_RE)
  if (yt) {
    return {
      tipo: 'youtube',
      id: yt[1],
      // youtube-nocookie no setea cookies de tracking hasta que le dan play.
      // playsinline=1 es crítico en iOS: sin eso Safari se va a pantalla completa.
      embedUrl: `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0&modestbranding=1&playsinline=1`,
    }
  }

  const vm = url.match(VIMEO_RE)
  if (vm) {
    const hash = vm[2] ? `&h=${vm[2]}` : '' // videos unlisted
    return {
      tipo: 'vimeo',
      id: vm[1],
      embedUrl: `https://player.vimeo.com/video/${vm[1]}?dnt=1${hash}`,
    }
  }

  return { tipo: 'archivo', id: null, embedUrl: null }
}

export const esLinkEmbed = (url) => parseVideoUrl(url).tipo !== 'archivo'
