import { getVideoEmbed } from '../utils/video'

// Muestra un video según su origen: iframe para YouTube/Vimeo, <video> para archivos directos.
export default function VideoPlayer({ url, className = '' }) {
  const video = getVideoEmbed(url)
  if (!video) return null

  if (video.type === 'file') {
    return <video src={video.embedUrl} controls className={className} />
  }

  return (
    <div className={`video-embed-wrap ${className}`}>
      <iframe
        src={video.embedUrl}
        title="Video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
