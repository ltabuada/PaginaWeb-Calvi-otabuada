import { useState } from 'react'
import { parseVideoUrl, videoSrc, videoPoster } from '../lib/media'

// Reproduce un video siempre DENTRO de la página: <video> para archivos
// subidos, iframe embebido para links de YouTube/Vimeo. Dar play nunca
// navega fuera del sitio.
export default function VideoPlayer({ url, title }) {
  const [usarOriginal, setUsarOriginal] = useState(false)
  const { tipo, embedUrl } = parseVideoUrl(url)

  if (tipo === 'youtube' || tipo === 'vimeo') {
    return (
      <div className="video-embed-wrap">
        <iframe
          src={embedUrl}
          title={title || 'Video'}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <video
      // Si la transformación on-the-fly falla (caso borde del plan free),
      // caemos a la URL cruda en vez de mostrar un cuadro negro mudo.
      src={usarOriginal ? url : videoSrc(url)}
      poster={videoPoster(url)}
      controls
      playsInline /* sin esto iOS se va a pantalla completa al dar play */
      preload="metadata"
      className="detail-video"
      onError={() => setUsarOriginal(true)}
    />
  )
}
