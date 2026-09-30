import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useListings } from '../context/ListingsContext'
import { useEmprendimientos } from '../context/EmprendimientosContext'
import { useConsultas } from '../context/ConsultasContext'
import { subirACloudinary, validarArchivo, borrarPorToken, esVideo, LIMITES } from '../lib/cloudinary'
import { imgMini, imgPreview, parseVideoUrl } from '../lib/media'
import VideoPlayer from '../components/VideoPlayer'
import MapView from '../components/MapView'
import LocationAutocomplete from '../components/LocationAutocomplete'

// Achica la imagen antes de subirla. No es para producir el asset final
// (de eso se encarga Cloudinary con q_auto/f_auto al servirla), sino para
// no chocar con el límite de 10 MB y para que subir 8 fotos no tarde una era.
const compressImage = (file, maxDim = 2560, quality = 0.85) =>
  new Promise(resolve => {
    // Recomprimir algo ya chico solo pierde calidad sin ganar nada.
    if (!file.type.startsWith('image/') || file.size < 400 * 1024) { resolve(file); return }

    const img = new Image()
    const blobUrl = URL.createObjectURL(file)
    let listo = false
    const terminar = (resultado) => {
      if (listo) return
      listo = true
      clearTimeout(timer)
      URL.revokeObjectURL(blobUrl)
      resolve(resultado)
    }
    // Red de seguridad: un archivo corrupto o un HEIC que el navegador carga
    // a medias puede dejar img.onload sin disparar nunca. Sin esto, el panel
    // se cuelga para siempre — que es exactamente el bug que estamos arreglando.
    const timer = setTimeout(() => terminar(file), 10000)

    img.onload = () => {
      const { width, height } = img
      const scale = (width > maxDim || height > maxDim) ? maxDim / Math.max(width, height) : 1
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(width * scale)
      canvas.height = Math.round(height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      // WebP pesa ~25-35% menos que JPEG; si el navegador no lo soporta, caemos a JPEG.
      const supportsWebp = canvas.toDataURL('image/webp').startsWith('data:image/webp')
      const type = supportsWebp ? 'image/webp' : 'image/jpeg'
      const ext = supportsWebp ? '.webp' : '.jpg'
      canvas.toBlob(
        blob => {
          // Recomprimir a veces agranda (PNGs chicos, WebPs ya optimizados).
          if (!blob || blob.size >= file.size) { terminar(file); return }
          terminar(new File([blob], file.name.replace(/\.[^.]+$/, ext), { type }))
        },
        type, quality
      )
    }
    // HEIC en Chrome/Firefox cae acá: se sube el original y Cloudinary lo convierte.
    img.onerror = () => terminar(file)
    img.src = blobUrl
  })

// Los errores de Firestore llegan como códigos; el admin necesita leer algo útil.
const errorGuardado = (err) => {
  if (err?.code === 'permission-denied') return 'No tenés permiso para guardar. Cerrá sesión y volvé a entrar.'
  if (err?.code === 'unavailable') return 'Sin conexión con la base. Revisá tu internet e intentá de nuevo.'
  return `No se pudo guardar: ${err?.message || 'error desconocido'}`
}

const EMPTY_FORM = {
  tipo: 'departamento',
  operacion: 'alquiler',
  titulo: '',
  ubicacion: '',
  precio: '',
  ambientes: '',
  dormitorios: '',
  banos: '',
  cocheras: '',
  superficie: '',
  expensas: '',
  descripcion: '',
  imagenes: '',
  videos: '',
  disponible: true,
  destacada: false,
}

const EMPTY_EMP_FORM = {
  titulo: '',
  descripcion: '',
  ubicacion: '',
  estado: 'en_pozo',
  tipo: 'departamento',
  precioDesde: '',
  superficieDesde: '',
  entrega: '',
  imagenes: '',
  videos: '',
  activo: true,
}

export default function AdminPanel() {
  const { logout } = useAuth()
  const { listings, addPropiedad, updatePropiedad, deletePropiedad, toggleDisponible, toggleDestacada } = useListings()
  const { emprendimientos, addEmprendimiento, updateEmprendimiento, deleteEmprendimiento, toggleActivo } = useEmprendimientos()
  const { consultas, marcarLeida, marcarRespondida, deleteConsulta, sinLeer } = useConsultas()
  const navigate = useNavigate()

  const [vista, setVista] = useState('lista')
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [toast, setToast] = useState(null)
  const [guardando, setGuardando] = useState(false)
  // Emprendimientos
  const [empForm, setEmpForm] = useState(EMPTY_EMP_FORM)
  const [empEditId, setEmpEditId] = useState(null)
  const [empConfirmDelete, setEmpConfirmDelete] = useState(null)
  // Consultas
  const [consultaFiltro, setConsultaFiltro] = useState('todas')
  const [consultaConfirmDelete, setConsultaConfirmDelete] = useState(null)
  // Upload
  const [uploadingProp, setUploadingProp] = useState(false)
  const [uploadingEmp, setUploadingEmp] = useState(false)
  const [uploadProgressProp, setUploadProgressProp] = useState([])
  const [uploadProgressEmp, setUploadProgressEmp] = useState([])
  const [uploadingPropVideo, setUploadingPropVideo] = useState(false)
  const [uploadingEmpVideo, setUploadingEmpVideo] = useState(false)
  const [uploadProgressPropVideo, setUploadProgressPropVideo] = useState([])
  const [uploadProgressEmpVideo, setUploadProgressEmpVideo] = useState([])
  const fileInputPropRef = useRef(null)
  const fileInputEmpRef = useRef(null)
  const fileInputPropVideoRef = useRef(null)
  const fileInputEmpVideoRef = useRef(null)
  const propImageTasksRef = useRef([])
  const empImageTasksRef = useRef([])
  const propVideoTasksRef = useRef([])
  const empVideoTasksRef = useRef([])
  // url -> delete_token de Cloudinary, para poder deshacer una subida recién hecha.
  const deleteTokensRef = useRef(new Map())
  // Links de YouTube/Vimeo que el admin está por agregar.
  const [videoLinkProp, setVideoLinkProp] = useState('')
  const [videoLinkEmp, setVideoLinkEmp] = useState('')

  const showToast = (msg, tipo = 'ok') => {
    setToast({ msg, tipo })
    // Un error hay que poder leerlo; un "guardado" no.
    setTimeout(() => setToast(null), tipo === 'error' ? 6000 : 2500)
  }

  const cancelUpload = (idx, tasksRef, setProgress) => {
    tasksRef.current[idx]?.cancel()
    setProgress(prev => prev.map((p, i) => i === idx ? { ...p, cancelled: true, progress: 0 } : p))
  }

  const renderProgress = (progressList, cancelFn, setProgress) => (
    <div className="upload-progress-list">
      {progressList.map((f, i) => {
        const compressing = f.phase === 'compress'
        return (
        <div key={i} className={`upload-progress-item${f.cancelled ? ' cancelled' : ''}${f.error ? ' error' : ''}`}>
          <span className="upload-filename">
            <i className={`fa-solid ${f.error ? 'fa-triangle-exclamation' : f.cancelled ? 'fa-ban' : f.done ? 'fa-circle-check' : compressing ? 'fa-compress fa-spin' : 'fa-arrow-up-from-bracket'}`} /> {f.name}
          </span>
          <div className="upload-bar-wrap">
            <div className="upload-bar" style={{ width: `${f.progress}%` }} />
          </div>
          <span className="upload-pct">
            {f.error
              ? <span className="upload-error-msg">{f.error}</span>
              : f.done
                ? <i className="fa-solid fa-circle-check" style={{color:'var(--primary)'}} />
                : f.cancelled
                  ? <span style={{color:'#999',fontSize:'.75rem'}}>Cancelado</span>
                  : compressing
                    ? <span style={{fontSize:'.75rem'}}>Comprimiendo {f.progress}%</span>
                    : `${f.progress}%`
            }
          </span>
          {!f.done && !f.cancelled && !compressing && !f.error && (
            <button type="button" className="upload-cancel-btn" onClick={() => cancelFn(i)} title="Cancelar subida">
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>
        )
      })}
      {progressList.some(f => f.error) && (
        <button type="button" className="upload-close-btn" onClick={() => setProgress([])}>
          Cerrar
        </button>
      )}
    </div>
  )

  // Sube imágenes o videos a Cloudinary y agrega las URLs al textarea del form.
  const handleSubirArchivos = async (e, formSetter, setUploading, setProgress, fieldName = 'imagenes', tasksRef, carpeta) => {
    const files = Array.from(e.target.files)
    // Liberar el input ya, no al final: si algo falla, el admin tiene que poder
    // volver a elegir el mismo archivo sin que el navegador lo ignore.
    e.target.value = ''
    if (!files.length) return

    // Validar antes de tocar la red: cero requests inútiles.
    const validos = []
    const rechazados = []
    for (const f of files) {
      const error = validarArchivo(f)
      if (error) rechazados.push(`${f.name}: ${error}`)
      else validos.push(f)
    }
    if (rechazados.length) {
      showToast(rechazados.length === 1 ? rechazados[0] : `${rechazados.length} archivos rechazados. ${rechazados[0]}`, 'error')
    }
    if (!validos.length) return

    const pesados = validos.filter(f => esVideo(f) && f.size > LIMITES.videoAviso)
    if (pesados.length) {
      showToast(`${pesados.length === 1 ? 'Ese video es pesado' : 'Esos videos son pesados'}: la subida y el primer play pueden tardar un rato.`)
    }

    setUploading(true)
    // Mostrar la lista YA, antes de comprimir: si no, hay un hueco sin feedback.
    setProgress(validos.map(f => ({
      name: f.name, progress: 0, done: false, cancelled: false,
      phase: esVideo(f) ? 'upload' : 'compress', error: null,
    })))

    // Los videos van crudos: Cloudinary transcodifica del lado del servidor.
    const procesados = await Promise.all(validos.map(async (f, i) => {
      if (esVideo(f)) return f
      const out = await compressImage(f)
      setProgress(prev => prev.map((p, idx) => idx === i ? { ...p, name: out.name, phase: 'upload' } : p))
      return out
    }))

    // Revalidar: comprimir pudo no alcanzar para bajar del límite.
    procesados.forEach((f, i) => {
      const error = validarArchivo(f)
      if (error) setProgress(prev => prev.map((p, idx) => idx === i ? { ...p, error } : p))
    })

    tasksRef.current = new Array(procesados.length).fill(null)
    const resultados = await Promise.all(procesados.map(async (file, i) => {
      if (validarArchivo(file)) return { ok: false, skip: true }
      const tarea = subirACloudinary(file, {
        folder: carpeta,
        onProgress: pct => setProgress(prev => prev.map((p, idx) => idx === i ? { ...p, progress: pct } : p)),
      })
      tasksRef.current[i] = tarea
      const res = await tarea.promise
      setProgress(prev => prev.map((p, idx) => idx === i
        ? { ...p, progress: res.ok ? 100 : 0, done: !!res.ok, cancelled: !!res.cancelled, error: res.error || null }
        : p))
      return res
    }))

    const urls = []
    for (const r of resultados) {
      if (!r.ok) continue
      urls.push(r.url)
      // El delete_token vive 10 minutos: alcanza para el "quitar" de esta sesión.
      if (r.deleteToken) deleteTokensRef.current.set(r.url, r.deleteToken)
    }

    if (urls.length) {
      formSetter(f => ({
        ...f,
        [fieldName]: (f[fieldName] || '').trim()
          ? (f[fieldName] || '').trim() + '\n' + urls.join('\n')
          : urls.join('\n'),
      }))
    }

    const fallados = resultados.filter(r => !r.ok && !r.cancelled && !r.skip)
    setUploading(false)
    tasksRef.current = []

    if (fallados.length) {
      showToast(`No se ${fallados.length === 1 ? 'pudo subir 1 archivo' : `pudieron subir ${fallados.length} archivos`}: ${fallados[0].error}`, 'error')
      // Dejar las filas visibles para que el error se pueda leer.
    } else {
      setProgress([])
      if (urls.length) showToast(`${urls.length} ${urls.length === 1 ? 'archivo subido' : 'archivos subidos'}.`)
    }
  }

  // Saca una URL del textarea y, si la subimos hace poco, la borra de Cloudinary.
  const quitarMedia = (url, formSetter, fieldName) => {
    formSetter(f => ({
      ...f,
      [fieldName]: (f[fieldName] || '').split('\n').map(s => s.trim()).filter(s => s && s !== url).join('\n'),
    }))
    const token = deleteTokensRef.current.get(url)
    if (token) {
      borrarPorToken(token)
      deleteTokensRef.current.delete(url)
    }
  }

  // Agrega un link de YouTube/Vimeo a la lista de videos.
  const agregarVideoLink = (valor, setValor, formSetter) => {
    const url = valor.trim()
    if (!url) return
    const { tipo } = parseVideoUrl(url)
    if (tipo === 'archivo' && !/^https?:\/\//i.test(url)) {
      showToast('Pegá un link completo de YouTube o Vimeo (tiene que empezar con https://).', 'error')
      return
    }
    formSetter(f => ({
      ...f,
      videos: (f.videos || '').trim() ? (f.videos || '').trim() + '\n' + url : url,
    }))
    setValor('')
    showToast(tipo === 'archivo' ? 'Link de video agregado.' : `Link de ${tipo === 'youtube' ? 'YouTube' : 'Vimeo'} agregado.`)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const abrirNueva = () => {
    setForm(EMPTY_FORM)
    setEditId(null)
    setVista('nueva')
  }

  const abrirEditar = (p) => {
    setForm({
      ...p,
      imagenes: p.imagenes.join('\n'),
      videos: (p.videos || []).join('\n'),
      precio: String(p.precio),
      ambientes: String(p.ambientes),
      dormitorios: String(p.dormitorios),
      banos: String(p.banos),
      superficie: String(p.superficie),
      expensas: String(p.expensas ?? ''),
    })
    setEditId(p.id)
    setVista('editar')
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    const imagenesArr = form.imagenes
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
    const videosArr = (form.videos || '').split('\n').map(s => s.trim()).filter(Boolean)

    const datos = {
      ...form,
      precio: parseInt(form.precio) || 0,
      ambientes: parseInt(form.ambientes) || 1,
      dormitorios: parseInt(form.dormitorios) || 1,
      banos: parseInt(form.banos) || 1,
      superficie: parseInt(form.superficie) || 0,
      expensas: parseInt(form.expensas) || 0,
      imagenes: imagenesArr,
      videos: videosArr,
    }

    setGuardando(true)
    try {
      if (vista === 'nueva') {
        await addPropiedad(datos)
        showToast('Propiedad agregada correctamente.')
      } else {
        await updatePropiedad(editId, datos)
        showToast('Propiedad actualizada correctamente.')
      }
      setVista('lista')
    } catch (err) {
      // Sin esto el admin ve un cartel verde y la propiedad nunca se guardó.
      showToast(errorGuardado(err), 'error')
    } finally {
      setGuardando(false)
    }
  }

  const handleConfirmDelete = async (id) => {
    setConfirmDelete(null)
    try {
      await deletePropiedad(id)
      showToast('Propiedad eliminada.')
    } catch (err) {
      showToast(errorGuardado(err), 'error')
    }
  }

  // ── EMPRENDIMIENTOS HANDLERS ──
  const abrirNuevaEmp = () => { setEmpForm(EMPTY_EMP_FORM); setEmpEditId(null); setVista('emp-nueva') }

  const abrirEditarEmp = (e) => {
    setEmpForm({ ...e, imagenes: e.imagenes.join('\n'), videos: (e.videos || []).join('\n'), precioDesde: String(e.precioDesde), superficieDesde: String(e.superficieDesde) })
    setEmpEditId(e.id)
    setVista('emp-editar')
  }

  const handleChangeEmp = (ev) => {
    const { name, value, type, checked } = ev.target
    setEmpForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleGuardarEmp = async (ev) => {
    ev.preventDefault()
    const imagenesArr = empForm.imagenes.split('\n').map(s => s.trim()).filter(Boolean)
    const videosArr = (empForm.videos || '').split('\n').map(s => s.trim()).filter(Boolean)
    const datos = { ...empForm, precioDesde: parseInt(empForm.precioDesde) || 0, superficieDesde: parseInt(empForm.superficieDesde) || 0, imagenes: imagenesArr, videos: videosArr }
    setGuardando(true)
    try {
      if (vista === 'emp-nueva') { await addEmprendimiento(datos); showToast('Emprendimiento agregado.') }
      else { await updateEmprendimiento(empEditId, datos); showToast('Emprendimiento actualizado.') }
      setVista('emp-lista')
    } catch (err) {
      showToast(errorGuardado(err), 'error')
    } finally {
      setGuardando(false)
    }
  }

  const handleConfirmDeleteEmp = (id) => {
    deleteEmprendimiento(id)
    setEmpConfirmDelete(null)
    showToast('Emprendimiento eliminado.')
  }

  return (
    <div className="admin-panel">

      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <i className="fa-solid fa-building" />
          <span>Admin Panel</span>
        </div>

        <nav className="admin-nav">
          <div className="admin-nav-label">Propiedades</div>
          <button
            className={`admin-nav-item${vista === 'lista' ? ' active' : ''}`}
            onClick={() => setVista('lista')}
          >
            <i className="fa-solid fa-list" /> Listar
          </button>
          <button className="admin-nav-item" onClick={abrirNueva}>
            <i className="fa-solid fa-plus" /> Nueva propiedad
          </button>
          <div className="admin-nav-label">Emprendimientos</div>
          <button
            className={`admin-nav-item${vista === 'emp-lista' ? ' active' : ''}`}
            onClick={() => setVista('emp-lista')}
          >
            <i className="fa-solid fa-building-columns" /> Listar
          </button>
          <button className="admin-nav-item" onClick={abrirNuevaEmp}>
            <i className="fa-solid fa-plus" /> Nuevo emprendimiento
          </button>
          <div className="admin-nav-label">Consultas</div>
          <button
            className={`admin-nav-item${vista === 'consultas' ? ' active' : ''}`}
            onClick={() => setVista('consultas')}
          >
            <i className="fa-solid fa-envelope" /> Consultas
            {sinLeer > 0 && <span className="nav-badge">{sinLeer}</span>}
          </button>
          <a href="/" className="admin-nav-item" target="_blank" rel="noreferrer">
            <i className="fa-solid fa-eye" /> Ver sitio
          </a>
        </nav>

        <button className="admin-logout-btn" onClick={handleLogout}>
          <i className="fa-solid fa-right-from-bracket" /> Cerrar sesión
        </button>
      </aside>

      {/* CONTENIDO */}
      <main className="admin-main">

        {/* TOAST */}
        {toast && (
          <div className={`admin-toast${toast.tipo === 'error' ? ' error' : ''}`}>
            <i className={`fa-solid ${toast.tipo === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-check'}`} /> {toast.msg}
          </div>
        )}

        {/* ===== LISTA ===== */}
        {vista === 'lista' && (
          <>
            <div className="admin-page-header">
              <div>
                <h1>Propiedades</h1>
                <p>{listings.length} propiedad{listings.length !== 1 ? 'es' : ''} en total</p>
              </div>
              <button className="admin-btn-primary" onClick={abrirNueva}>
                <i className="fa-solid fa-plus" /> Nueva propiedad
              </button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Propiedad</th>
                    <th>Tipo</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th>Destacada</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map(p => (
                    <tr key={p.id} className={!p.disponible ? 'row-inactiva' : ''}>
                      <td>
                        <div className="table-propiedad">
                          <img src={imgMini(p.imagenes?.[0])} alt={p.titulo} className={`table-thumb${!p.imagenes?.[0] ? ' no-img' : ''}`} onError={e => e.currentTarget.classList.add('no-img')} />
                          <div>
                            <div className="table-titulo">{p.titulo}</div>
                            <div className="table-ubicacion">
                              <i className="fa-solid fa-location-dot" /> {p.ubicacion}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td><span className="table-tipo">{p.tipo}</span></td>
                      <td className="table-precio">${new Intl.NumberFormat('es-AR').format(p.precio)}</td>
                      <td>
                        <button
                          className={`status-toggle ${p.disponible ? 'disponible' : 'no-disponible'}`}
                          onClick={() => { toggleDisponible(p.id); showToast('Estado actualizado.') }}
                          title="Cambiar estado"
                        >
                          <i className={`fa-solid fa-circle${p.disponible ? '' : '-xmark'}`} />
                          {p.disponible ? 'Disponible' : 'No disponible'}
                        </button>
                      </td>
                      <td>
                        <button
                          className={`destacada-toggle ${p.destacada ? 'activa' : ''}`}
                          onClick={() => { toggleDestacada(p.id); showToast('Destacada actualizada.') }}
                          title="Marcar como destacada"
                        >
                          <i className={`fa-${p.destacada ? 'solid' : 'regular'} fa-star`} />
                        </button>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="action-btn edit" onClick={() => abrirEditar(p)} title="Editar">
                            <i className="fa-solid fa-pen" />
                          </button>
                          <button className="action-btn view" onClick={() => window.open(`/propiedad/${p.id}`, '_blank')} title="Ver en sitio">
                            <i className="fa-solid fa-eye" />
                          </button>
                          <button className="action-btn delete" onClick={() => setConfirmDelete(p.id)} title="Eliminar">
                            <i className="fa-solid fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ===== FORMULARIO NUEVA / EDITAR ===== */}
        {(vista === 'nueva' || vista === 'editar') && (
          <>
            <div className="admin-page-header">
              <div>
                <h1>{vista === 'nueva' ? 'Nueva propiedad' : 'Editar propiedad'}</h1>
                <p>{vista === 'nueva' ? 'Completá los datos de la nueva propiedad' : 'Modificá los campos que necesites'}</p>
              </div>
              <button className="admin-btn-secondary" onClick={() => setVista('lista')}>
                <i className="fa-solid fa-arrow-left" /> Volver
              </button>
            </div>

            <form onSubmit={handleGuardar} className="admin-form">

              <div className="form-section">
                <h3><i className="fa-solid fa-info-circle" /> Información general</h3>
                <div className="form-grid">
                  <div className="form-field full">
                    <label>Título *</label>
                    <input name="titulo" value={form.titulo} onChange={handleChange} placeholder="Ej: Departamento luminoso en Palermo" required />
                  </div>
                  <div className="form-field full">
                    <label>Ubicación *</label>
                    <LocationAutocomplete
                      value={form.ubicacion}
                      onChange={(val) => setForm(f => ({ ...f, ubicacion: val }))}
                      placeholder="Ej: Av. Corrientes 1234, Buenos Aires"
                      required
                    />
                    <MapView address={form.ubicacion} height="250px" />
                  </div>
                  <div className="form-field">
                    <label>Tipo *</label>
                    <select name="tipo" value={form.tipo} onChange={handleChange} required>
                      <option value="departamento">Departamento</option>
                      <option value="casa">Casa</option>
                      <option value="ph">PH</option>
                      <option value="terreno">Terreno</option>
                      <option value="galpon">Galpón</option>
                      <option value="local">Local</option>
                      <option value="oficina">Oficina</option>
                      <option value="otros">Otros</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Operación *</label>
                    <select name="operacion" value={form.operacion} onChange={handleChange} required>
                      <option value="alquiler">Alquiler</option>
                      <option value="venta">Venta</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Precio {form.operacion === 'alquiler' ? '($/mes)' : '(USD)'} *</label>
                    <input name="precio" type="number" min="0" value={form.precio} onChange={handleChange} placeholder="280000" required />
                  </div>
                  <div className="form-field">
                    <label>Expensas ($)</label>
                    <input name="expensas" type="number" min="0" value={form.expensas} onChange={handleChange} placeholder="0" />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3><i className="fa-solid fa-ruler" /> Características</h3>
                <div className="form-grid">
                  <div className="form-field">
                    <label>Ambientes *</label>
                    <input name="ambientes" type="number" min="1" max="20" value={form.ambientes} onChange={handleChange} placeholder="2" required />
                  </div>
                  <div className="form-field">
                    <label>Dormitorios *</label>
                    <input name="dormitorios" type="number" min="0" max="20" value={form.dormitorios} onChange={handleChange} placeholder="1" required />
                  </div>
                  <div className="form-field">
                    <label>Baños *</label>
                    <input name="banos" type="number" min="1" max="10" value={form.banos} onChange={handleChange} placeholder="1" required />
                  </div>
                  <div className="form-field">
                    <label>Cocheras</label>
                    <input name="cocheras" type="number" min="0" max="10" value={form.cocheras} onChange={handleChange} placeholder="0" />
                  </div>
                  <div className="form-field">
                    <label>Superficie (m²) *</label>
                    <input name="superficie" type="number" min="1" value={form.superficie} onChange={handleChange} placeholder="52" required />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3><i className="fa-solid fa-align-left" /> Descripción</h3>
                <div className="form-grid">
                  <div className="form-field full">
                    <label>Descripción *</label>
                    <textarea
                      name="descripcion"
                      value={form.descripcion}
                      onChange={handleChange}
                      placeholder="Describí la propiedad..."
                      rows={4}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3><i className="fa-solid fa-images" /> Imágenes</h3>
                <div className="form-grid">
                  <div className="form-field full">
                    <label>Subir imágenes desde tu dispositivo</label>
                    <div className="upload-area" onClick={() => fileInputPropRef.current.click()}>
                      <input
                        ref={fileInputPropRef}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={e => handleSubirArchivos(e, setForm, setUploadingProp, setUploadProgressProp, 'imagenes', propImageTasksRef, 'calvi/propiedades')}
                      />
                      <i className="fa-solid fa-cloud-arrow-up" />
                      <span>{uploadingProp ? 'Subiendo...' : 'Hacé clic para seleccionar imágenes'}</span>
                      <small>PNG, JPG, WEBP, HEIC — hasta 10 MB por imagen. Se optimizan solas al subirlas.</small>
                    </div>
                    {uploadProgressProp.length > 0 && renderProgress(uploadProgressProp, i => cancelUpload(i, propImageTasksRef, setUploadProgressProp), setUploadProgressProp)}
                  </div>
                  <div className="form-field full">
                    <label>O pegá URLs de imágenes (una por línea)</label>
                    <textarea
                      name="imagenes"
                      value={form.imagenes}
                      onChange={handleChange}
                      placeholder={"https://images.unsplash.com/photo-xxx?w=800\nhttps://images.unsplash.com/photo-yyy?w=800"}
                      rows={4}
                    />
                    <span className="form-hint">
                      <i className="fa-solid fa-circle-info" /> Las imágenes subidas se agregan automáticamente a esta lista.
                    </span>
                  </div>
                  {form.imagenes && (
                    <div className="form-field full">
                      <label>Vista previa</label>
                      <div className="img-preview-grid">
                        {form.imagenes.split('\n').map(s => s.trim()).filter(Boolean).map((url, i) => (
                          <div key={i} className="preview-item">
                            <img src={imgPreview(url)} alt={`preview ${i + 1}`} className="img-preview" onError={e => e.target.style.opacity = '0.3'} />
                            <button type="button" className="preview-remove" title="Quitar" onClick={() => quitarMedia(url, setForm, 'imagenes')}>
                              <i className="fa-solid fa-xmark" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-section">
                <h3><i className="fa-solid fa-video" /> Videos</h3>
                <div className="form-grid">
                  <div className="form-field full">
                    <label>Subir videos desde tu dispositivo</label>
                    <div className="upload-area" onClick={() => fileInputPropVideoRef.current.click()}>
                      <input
                        ref={fileInputPropVideoRef}
                        type="file"
                        accept="video/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={e => handleSubirArchivos(e, setForm, setUploadingPropVideo, setUploadProgressPropVideo, 'videos', propVideoTasksRef, 'calvi/propiedades')}
                      />
                      <i className="fa-solid fa-film" />
                      <span>{uploadingPropVideo ? 'Subiendo...' : 'Hacé clic para seleccionar videos'}</span>
                      <small>MP4, MOV, WEBM — hasta 100 MB por archivo. ¿Video largo? Subilo a YouTube y pegá el link abajo.</small>
                    </div>
                    {uploadProgressPropVideo.length > 0 && renderProgress(uploadProgressPropVideo, i => cancelUpload(i, propVideoTasksRef, setUploadProgressPropVideo), setUploadProgressPropVideo)}
                  </div>
                  <div className="form-field full">
                    <label>O pegá un link de YouTube o Vimeo</label>
                    <div className="link-add-row">
                      <input
                        type="url"
                        value={videoLinkProp}
                        onChange={ev => setVideoLinkProp(ev.target.value)}
                        onKeyDown={ev => { if (ev.key === 'Enter') { ev.preventDefault(); agregarVideoLink(videoLinkProp, setVideoLinkProp, setForm) } }}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                      <button type="button" className="admin-btn-secondary" onClick={() => agregarVideoLink(videoLinkProp, setVideoLinkProp, setForm)}>
                        <i className="fa-brands fa-youtube" /> Agregar link
                      </button>
                    </div>
                    <span className="form-hint">
                      <i className="fa-solid fa-circle-info" /> Se reproduce dentro de la página, sin salir del sitio.
                    </span>
                  </div>
                  <div className="form-field full">
                    <label>Lista de videos (una URL por línea)</label>
                    <textarea
                      name="videos"
                      value={form.videos}
                      onChange={handleChange}
                      placeholder={"https://www.youtube.com/watch?v=...\nhttps://res.cloudinary.com/..."}
                      rows={3}
                    />
                    <span className="form-hint">
                      <i className="fa-solid fa-circle-info" /> Los videos subidos y los links agregados aparecen acá automáticamente.
                    </span>
                  </div>
                  {form.videos && (
                    <div className="form-field full">
                      <label>Vista previa de videos</label>
                      <div className="video-preview-grid">
                        {form.videos.split('\n').map(s => s.trim()).filter(Boolean).map((url, i) => (
                          <div key={i} className="preview-item">
                            <VideoPlayer url={url} title={`Video ${i + 1}`} />
                            <button type="button" className="preview-remove" title="Quitar" onClick={() => quitarMedia(url, setForm, 'videos')}>
                              <i className="fa-solid fa-xmark" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-section">
                <h3><i className="fa-solid fa-toggle-on" /> Configuración</h3>
                <div className="form-checkboxes">
                  <label className="checkbox-label">
                    <input type="checkbox" name="disponible" checked={form.disponible} onChange={handleChange} />
                    <span className="checkbox-custom" />
                    <div>
                      <strong>Disponible</strong>
                      <span>Visible para los usuarios del sitio</span>
                    </div>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" name="destacada" checked={form.destacada} onChange={handleChange} />
                    <span className="checkbox-custom" />
                    <div>
                      <strong>Propiedad destacada</strong>
                      <span>Aparece en la sección de destacadas en el inicio</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setVista('lista')}>
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-primary" disabled={guardando}>
                  <i className={`fa-solid ${guardando ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`} />
                  {guardando ? 'Guardando...' : vista === 'nueva' ? 'Agregar propiedad' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ===== EMP LISTA ===== */}
        {vista === 'emp-lista' && (
          <>
            <div className="admin-page-header">
              <div>
                <h1>Emprendimientos</h1>
                <p>{emprendimientos.length} emprendimiento{emprendimientos.length !== 1 ? 's' : ''} en total</p>
              </div>
              <button className="admin-btn-primary" onClick={abrirNuevaEmp}>
                <i className="fa-solid fa-plus" /> Nuevo emprendimiento
              </button>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Emprendimiento</th>
                    <th>Estado</th>
                    <th>Precio desde</th>
                    <th>Entrega</th>
                    <th>Activo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {emprendimientos.map(e => (
                    <tr key={e.id} className={!e.activo ? 'row-inactiva' : ''}>
                      <td>
                        <div className="table-propiedad">
                          <img src={imgMini(e.imagenes?.[0])} alt={e.titulo} className={`table-thumb${!e.imagenes?.[0] ? ' no-img' : ''}`} onError={ev => ev.currentTarget.classList.add('no-img')} />
                          <div>
                            <div className="table-titulo">{e.titulo}</div>
                            <div className="table-ubicacion"><i className="fa-solid fa-location-dot" /> {e.ubicacion}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`emp-estado-badge emp-estado-${e.estado}`}>
                          {e.estado === 'en_pozo' ? 'En pozo' : e.estado === 'en_construccion' ? 'En construcción' : 'A estrenar'}
                        </span>
                      </td>
                      <td className="table-precio">USD {new Intl.NumberFormat('es-AR').format(e.precioDesde)}</td>
                      <td>{e.entrega || '—'}</td>
                      <td>
                        <button
                          className={`status-toggle ${e.activo ? 'disponible' : 'no-disponible'}`}
                          onClick={() => { toggleActivo(e.id); showToast('Estado actualizado.') }}
                        >
                          <i className={`fa-solid fa-circle${e.activo ? '' : '-xmark'}`} />
                          {e.activo ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="action-btn edit" onClick={() => abrirEditarEmp(e)} title="Editar">
                            <i className="fa-solid fa-pen" />
                          </button>
                          <button className="action-btn delete" onClick={() => setEmpConfirmDelete(e.id)} title="Eliminar">
                            <i className="fa-solid fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ===== EMP FORMULARIO ===== */}
        {(vista === 'emp-nueva' || vista === 'emp-editar') && (
          <>
            <div className="admin-page-header">
              <div>
                <h1>{vista === 'emp-nueva' ? 'Nuevo emprendimiento' : 'Editar emprendimiento'}</h1>
                <p>{vista === 'emp-nueva' ? 'Completá los datos del emprendimiento' : 'Modificá los campos que necesites'}</p>
              </div>
              <button className="admin-btn-secondary" onClick={() => setVista('emp-lista')}>
                <i className="fa-solid fa-arrow-left" /> Volver
              </button>
            </div>
            <form onSubmit={handleGuardarEmp} className="admin-form">
              <div className="form-section">
                <h3><i className="fa-solid fa-info-circle" /> Información general</h3>
                <div className="form-grid">
                  <div className="form-field full">
                    <label>Título *</label>
                    <input name="titulo" value={empForm.titulo} onChange={handleChangeEmp} placeholder="Ej: Torre Libertad — Palermo" required />
                  </div>
                  <div className="form-field full">
                    <label>Ubicación *</label>
                    <LocationAutocomplete
                      value={empForm.ubicacion}
                      onChange={(val) => setEmpForm(f => ({ ...f, ubicacion: val }))}
                      placeholder="Ej: Av. Corrientes 1234, Buenos Aires"
                      required
                    />
                    <MapView address={empForm.ubicacion} height="250px" />
                  </div>
                  <div className="form-field">
                    <label>Estado *</label>
                    <select name="estado" value={empForm.estado} onChange={handleChangeEmp} required>
                      <option value="en_pozo">En pozo</option>
                      <option value="en_construccion">En construcción</option>
                      <option value="a_estrenar">A estrenar</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Tipo de unidades</label>
                    <select name="tipo" value={empForm.tipo} onChange={handleChangeEmp}>
                      <option value="departamento">Departamento</option>
                      <option value="casa">Casa</option>
                      <option value="ph">PH</option>
                      <option value="local">Local</option>
                      <option value="oficina">Oficina</option>
                      <option value="otros">Otros</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Precio desde (USD)</label>
                    <input name="precioDesde" type="number" min="0" value={empForm.precioDesde} onChange={handleChangeEmp} placeholder="80000" />
                  </div>
                  <div className="form-field">
                    <label>Superficie desde (m²)</label>
                    <input name="superficieDesde" type="number" min="0" value={empForm.superficieDesde} onChange={handleChangeEmp} placeholder="42" />
                  </div>
                  <div className="form-field">
                    <label>Fecha estimada de entrega</label>
                    <input name="entrega" value={empForm.entrega} onChange={handleChangeEmp} placeholder="Ej: Diciembre 2027" />
                  </div>
                </div>
              </div>
              <div className="form-section">
                <h3><i className="fa-solid fa-align-left" /> Descripción</h3>
                <div className="form-grid">
                  <div className="form-field full">
                    <label>Descripción *</label>
                    <textarea name="descripcion" value={empForm.descripcion} onChange={handleChangeEmp} placeholder="Describí el emprendimiento..." rows={4} required />
                  </div>
                </div>
              </div>
              <div className="form-section">
                <h3><i className="fa-solid fa-images" /> Imágenes</h3>
                <div className="form-grid">
                  <div className="form-field full">
                    <label>Subir imágenes desde tu dispositivo</label>
                    <div className="upload-area" onClick={() => fileInputEmpRef.current.click()}>
                      <input
                        ref={fileInputEmpRef}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={e => handleSubirArchivos(e, setEmpForm, setUploadingEmp, setUploadProgressEmp, 'imagenes', empImageTasksRef, 'calvi/emprendimientos')}
                      />
                      <i className="fa-solid fa-cloud-arrow-up" />
                      <span>{uploadingEmp ? 'Subiendo...' : 'Hacé clic para seleccionar imágenes'}</span>
                      <small>PNG, JPG, WEBP, HEIC — hasta 10 MB por imagen. Se optimizan solas al subirlas.</small>
                    </div>
                    {uploadProgressEmp.length > 0 && renderProgress(uploadProgressEmp, i => cancelUpload(i, empImageTasksRef, setUploadProgressEmp), setUploadProgressEmp)}
                  </div>
                  <div className="form-field full">
                    <label>O pegá URLs de imágenes (una por línea)</label>
                    <textarea name="imagenes" value={empForm.imagenes} onChange={handleChangeEmp} placeholder="https://..." rows={4} />
                    <span className="form-hint">
                      <i className="fa-solid fa-circle-info" /> Las imágenes subidas se agregan automáticamente a esta lista.
                    </span>
                  </div>
                  {empForm.imagenes && (
                    <div className="form-field full">
                      <label>Vista previa</label>
                      <div className="img-preview-grid">
                        {empForm.imagenes.split('\n').map(s => s.trim()).filter(Boolean).map((url, i) => (
                          <div key={i} className="preview-item">
                            <img src={imgPreview(url)} alt={`preview ${i + 1}`} className="img-preview" onError={e => e.target.style.opacity = '0.3'} />
                            <button type="button" className="preview-remove" title="Quitar" onClick={() => quitarMedia(url, setEmpForm, 'imagenes')}>
                              <i className="fa-solid fa-xmark" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-section">
                <h3><i className="fa-solid fa-video" /> Videos</h3>
                <div className="form-grid">
                  <div className="form-field full">
                    <label>Subir videos desde tu dispositivo</label>
                    <div className="upload-area" onClick={() => fileInputEmpVideoRef.current.click()}>
                      <input
                        ref={fileInputEmpVideoRef}
                        type="file"
                        accept="video/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={e => handleSubirArchivos(e, setEmpForm, setUploadingEmpVideo, setUploadProgressEmpVideo, 'videos', empVideoTasksRef, 'calvi/emprendimientos')}
                      />
                      <i className="fa-solid fa-film" />
                      <span>{uploadingEmpVideo ? 'Subiendo...' : 'Hacé clic para seleccionar videos'}</span>
                      <small>MP4, MOV, WEBM — hasta 100 MB por archivo. ¿Video largo? Subilo a YouTube y pegá el link abajo.</small>
                    </div>
                    {uploadProgressEmpVideo.length > 0 && renderProgress(uploadProgressEmpVideo, i => cancelUpload(i, empVideoTasksRef, setUploadProgressEmpVideo), setUploadProgressEmpVideo)}
                  </div>
                  <div className="form-field full">
                    <label>O pegá un link de YouTube o Vimeo</label>
                    <div className="link-add-row">
                      <input
                        type="url"
                        value={videoLinkEmp}
                        onChange={ev => setVideoLinkEmp(ev.target.value)}
                        onKeyDown={ev => { if (ev.key === 'Enter') { ev.preventDefault(); agregarVideoLink(videoLinkEmp, setVideoLinkEmp, setEmpForm) } }}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                      <button type="button" className="admin-btn-secondary" onClick={() => agregarVideoLink(videoLinkEmp, setVideoLinkEmp, setEmpForm)}>
                        <i className="fa-brands fa-youtube" /> Agregar link
                      </button>
                    </div>
                    <span className="form-hint">
                      <i className="fa-solid fa-circle-info" /> Se reproduce dentro de la página, sin salir del sitio.
                    </span>
                  </div>
                  <div className="form-field full">
                    <label>Lista de videos (una URL por línea)</label>
                    <textarea name="videos" value={empForm.videos} onChange={handleChangeEmp} placeholder={"https://www.youtube.com/watch?v=...\nhttps://res.cloudinary.com/..."} rows={3} />
                    <span className="form-hint">
                      <i className="fa-solid fa-circle-info" /> Los videos subidos y los links agregados aparecen acá automáticamente.
                    </span>
                  </div>
                  {empForm.videos && (
                    <div className="form-field full">
                      <label>Vista previa de videos</label>
                      <div className="video-preview-grid">
                        {empForm.videos.split('\n').map(s => s.trim()).filter(Boolean).map((url, i) => (
                          <div key={i} className="preview-item">
                            <VideoPlayer url={url} title={`Video ${i + 1}`} />
                            <button type="button" className="preview-remove" title="Quitar" onClick={() => quitarMedia(url, setEmpForm, 'videos')}>
                              <i className="fa-solid fa-xmark" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-section">
                <h3><i className="fa-solid fa-toggle-on" /> Configuración</h3>
                <div className="form-checkboxes">
                  <label className="checkbox-label">
                    <input type="checkbox" name="activo" checked={empForm.activo} onChange={handleChangeEmp} />
                    <span className="checkbox-custom" />
                    <div><strong>Activo</strong><span>Visible para los usuarios del sitio</span></div>
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setVista('emp-lista')}>Cancelar</button>
                <button type="submit" className="admin-btn-primary" disabled={guardando}>
                  <i className={`fa-solid ${guardando ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`} />
                  {guardando ? 'Guardando...' : vista === 'emp-nueva' ? 'Agregar emprendimiento' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ===== CONSULTAS ===== */}
        {vista === 'consultas' && (() => {
          const formatFecha = (ts) => {
            if (!ts?.toDate) return '...'
            return ts.toDate().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
          }
          const lista = consultaFiltro === 'sin-leer'
            ? consultas.filter(c => !c.leida)
            : consultas
          return (
            <>
              <div className="admin-page-header">
                <div>
                  <h1>Consultas</h1>
                  <p>{consultas.length} consulta{consultas.length !== 1 ? 's' : ''} · {sinLeer} sin leer</p>
                </div>
              </div>

              <div className="consultas-filtros">
                <button
                  className={`consulta-filtro-btn${consultaFiltro === 'todas' ? ' active' : ''}`}
                  onClick={() => setConsultaFiltro('todas')}
                >
                  Todas ({consultas.length})
                </button>
                <button
                  className={`consulta-filtro-btn${consultaFiltro === 'sin-leer' ? ' active' : ''}`}
                  onClick={() => setConsultaFiltro('sin-leer')}
                >
                  Sin leer ({sinLeer})
                </button>
              </div>

              {lista.length === 0 && (
                <div className="consultas-empty">
                  <i className="fa-solid fa-inbox" />
                  <p>{consultaFiltro === 'sin-leer' ? 'No hay consultas sin leer.' : 'Aún no hay consultas.'}</p>
                </div>
              )}

              <div className="consultas-list">
                {lista.map(c => (
                  <div key={c._docId} className={`consulta-card${!c.leida ? ' unread' : ''}`}>
                    <div className="consulta-header">
                      <div className="consulta-info">
                        {!c.leida && <span className="unread-dot" />}
                        <strong className="consulta-nombre">{c.nombre}</strong>
                        <span className="consulta-tipo-badge consulta-tipo-{c.tipo}">
                          {c.tipo === 'propiedad' ? <><i className="fa-solid fa-building" /> {c.propiedadTitulo}</> : <><i className="fa-solid fa-envelope" /> Consulta general</>}
                        </span>
                        {c.asunto && c.tipo === 'general' && (
                          <span className="consulta-asunto">{c.asunto}</span>
                        )}
                      </div>
                      <span className="consulta-fecha">{formatFecha(c.fecha)}</span>
                    </div>

                    <div className="consulta-contacto">
                      <a href={`mailto:${c.email}`} className="consulta-email">
                        <i className="fa-solid fa-envelope" /> {c.email}
                      </a>
                      {c.telefono && (
                        <a href={`tel:${c.telefono}`} className="consulta-tel">
                          <i className="fa-solid fa-phone" /> {c.telefono}
                        </a>
                      )}
                    </div>

                    <p className="consulta-mensaje">{c.mensaje}</p>

                    <div className="consulta-actions">
                      <a
                        href={`mailto:${c.email}?subject=Re: ${c.tipo === 'propiedad' ? `Consulta sobre ${c.propiedadTitulo}` : c.asunto || 'Su consulta'}&body=Estimado/a ${c.nombre},%0A%0A`}
                        className="admin-btn-primary consulta-btn"
                        onClick={() => { if (!c.respondida) marcarRespondida(c._docId, false) }}
                      >
                        <i className="fa-solid fa-reply" /> Responder por email
                      </a>
                      <button
                        className={`admin-btn-secondary consulta-btn${c.respondida ? ' respondida' : ''}`}
                        onClick={() => marcarRespondida(c._docId, c.respondida)}
                      >
                        <i className={`fa-${c.respondida ? 'solid' : 'regular'} fa-circle-check`} />
                        {c.respondida ? 'Respondida' : 'Marcar respondida'}
                      </button>
                      <button
                        className={`admin-btn-secondary consulta-btn${c.leida ? '' : ' btn-leida'}`}
                        onClick={() => marcarLeida(c._docId, c.leida)}
                      >
                        <i className={`fa-${c.leida ? 'regular' : 'solid'} fa-envelope${c.leida ? '-open' : ''}`} />
                        {c.leida ? 'Marcar no leída' : 'Marcar leída'}
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => setConsultaConfirmDelete(c._docId)}
                        title="Eliminar"
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    </div>

                    {c.respondida && (
                      <div className="consulta-respondida-badge">
                        <i className="fa-solid fa-circle-check" /> Respondida
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )
        })()}
      </main>

      {/* MODAL CONFIRMACIÓN ELIMINAR */}
      {confirmDelete && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon danger">
              <i className="fa-solid fa-triangle-exclamation" />
            </div>
            <h3>¿Eliminar propiedad?</h3>
            <p>Esta acción no se puede deshacer. La propiedad será eliminada permanentemente.</p>
            <div className="modal-actions">
              <button className="admin-btn-secondary" onClick={() => setConfirmDelete(null)}>
                Cancelar
              </button>
              <button className="admin-btn-danger" onClick={() => handleConfirmDelete(confirmDelete)}>
                <i className="fa-solid fa-trash" /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR EMPRENDIMIENTO */}
      {empConfirmDelete && (
        <div className="admin-modal-overlay" onClick={() => setEmpConfirmDelete(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon danger">
              <i className="fa-solid fa-triangle-exclamation" />
            </div>
            <h3>¿Eliminar emprendimiento?</h3>
            <p>Esta acción no se puede deshacer. El emprendimiento será eliminado permanentemente.</p>
            <div className="modal-actions">
              <button className="admin-btn-secondary" onClick={() => setEmpConfirmDelete(null)}>Cancelar</button>
              <button className="admin-btn-danger" onClick={() => handleConfirmDeleteEmp(empConfirmDelete)}>
                <i className="fa-solid fa-trash" /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR CONSULTA */}
      {consultaConfirmDelete && (
        <div className="admin-modal-overlay" onClick={() => setConsultaConfirmDelete(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon danger">
              <i className="fa-solid fa-triangle-exclamation" />
            </div>
            <h3>¿Eliminar consulta?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button className="admin-btn-secondary" onClick={() => setConsultaConfirmDelete(null)}>Cancelar</button>
              <button className="admin-btn-danger" onClick={() => { deleteConsulta(consultaConfirmDelete); setConsultaConfirmDelete(null); showToast('Consulta eliminada.') }}>
                <i className="fa-solid fa-trash" /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
