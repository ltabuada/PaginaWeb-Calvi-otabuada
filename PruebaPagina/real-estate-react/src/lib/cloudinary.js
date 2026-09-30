// Subida de archivos a Cloudinary con unsigned upload preset.
// No hace falta backend: el preset es público por diseño (ver .env.example).

const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

if (!CLOUD || !PRESET) {
  console.error(
    '[cloudinary] Falta VITE_CLOUDINARY_CLOUD_NAME o VITE_CLOUDINARY_UPLOAD_PRESET. ' +
    'Completá el .env y REINICIÁ el dev server: Vite lee las variables solo al arrancar.'
  )
}

const MB = 1024 * 1024

// Límites del plan free de Cloudinary. Si cambian, se cambian acá.
export const LIMITES = {
  imagen: 10 * MB,
  video: 100 * MB,
  videoAviso: 40 * MB, // no bloquea, solo avisa que va a tardar
}

const EXT_VIDEO = /\.(mp4|mov|m4v|webm|avi|mkv|3gp|mpg|mpeg|wmv|flv)$/i

// Algunos .MOV llegan del Finder con file.type vacío, así que miramos la extensión también.
export const esVideo = (file) =>
  file.type.startsWith('video/') || EXT_VIDEO.test(file.name)

const mb = (bytes) => Math.round(bytes / MB)

// Devuelve null si el archivo está OK, o un mensaje de error en español.
export function validarArchivo(file) {
  if (!CLOUD || !PRESET) {
    return 'falta configurar Cloudinary (VITE_CLOUDINARY_*). Revisá el .env y reiniciá el servidor.'
  }
  if (esVideo(file)) {
    if (file.size > LIMITES.video) {
      return `el video pesa ${mb(file.size)} MB y el máximo es ${mb(LIMITES.video)} MB. ` +
             'Para videos largos, subilo a YouTube y pegá el link acá abajo.'
    }
    return null
  }
  if (!file.type.startsWith('image/') && !/\.(jpe?g|png|webp|gif|avif|heic|heif)$/i.test(file.name)) {
    return 'formato no soportado. Subí imágenes (JPG, PNG, WEBP, HEIC) o videos (MP4, MOV, WEBM).'
  }
  if (file.size > LIMITES.imagen) {
    return `la imagen pesa ${mb(file.size)} MB y el máximo es ${mb(LIMITES.imagen)} MB. ` +
           'Probá reducirla antes de subirla.'
  }
  return null
}

// Sube un archivo y devuelve { promise, cancel }.
// La promesa NUNCA rechaza: siempre resuelve con ok:true, ok:false+error, o ok:false+cancelled.
// El cancelador se llama `cancel` a propósito, para que cancelUpload() del panel no cambie.
export function subirACloudinary(file, { folder, onProgress } = {}) {
  const xhr = new XMLHttpRequest()

  const promise = new Promise((resolve) => {
    const datos = new FormData()
    datos.append('file', file)
    datos.append('upload_preset', PRESET)
    if (folder) datos.append('folder', folder)

    // Endpoint 'auto': Cloudinary decide si es imagen o video y devuelve el
    // secure_url con el path correcto. Evita tener que adivinarlo desde el MIME,
    // que es justo lo que falla con los .MOV sin type.
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD}/auto/upload`)
    xhr.timeout = 10 * 60 * 1000

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return
      // Capado a 99: que los bytes hayan salido no significa que Cloudinary
      // ya lo haya procesado. El 100% lo pone onload.
      onProgress?.(Math.min(99, Math.round((e.loaded / e.total) * 100)))
    }

    xhr.onload = () => {
      let data = null
      try { data = JSON.parse(xhr.responseText) } catch { /* respuesta no-JSON */ }

      if (xhr.status >= 200 && xhr.status < 300 && data?.secure_url) {
        onProgress?.(100)
        resolve({
          ok: true,
          url: data.secure_url,
          publicId: data.public_id,
          resourceType: data.resource_type,
          deleteToken: data.delete_token || null,
          bytes: data.bytes,
        })
        return
      }
      // Cloudinary manda errores muy descriptivos; mostrarlos es la mitad del arreglo.
      resolve({ ok: false, error: data?.error?.message || `error ${xhr.status} al subir` })
    }

    xhr.onerror = () => resolve({ ok: false, error: 'no se pudo conectar con Cloudinary. Revisá tu conexión.' })
    xhr.ontimeout = () => resolve({ ok: false, error: 'la subida tardó demasiado y se canceló.' })
    xhr.onabort = () => resolve({ ok: false, cancelled: true })

    xhr.send(datos)
  })

  return { promise, cancel: () => xhr.abort() }
}

// Borra un archivo recién subido. El delete_token vive solo 10 minutos:
// sirve para el "uy, me equivoqué", no para limpiar meses después.
export async function borrarPorToken(token) {
  if (!token || !CLOUD) return false
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/delete_by_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    return res.ok
  } catch {
    return false // si expiró no hay nada accionable para el admin
  }
}
