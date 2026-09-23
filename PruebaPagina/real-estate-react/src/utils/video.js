// Detecta el tipo de video a partir de una URL y devuelve la URL lista para incrustar.
// Soporta YouTube (watch, youtu.be, shorts, embed), Vimeo y archivos directos (Firebase, mp4, etc.)
export function getVideoEmbed(url) {
  const u = (url || '').trim()
  if (!u) return null

  // YouTube
  const yt = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/)
  if (yt) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${yt[1]}` }
  }

  // Vimeo
  const vm = u.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/)
  if (vm) {
    return { type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vm[1]}` }
  }

  // Archivo directo (Firebase Storage, .mp4, .webm, etc.)
  return { type: 'file', embedUrl: u }
}
