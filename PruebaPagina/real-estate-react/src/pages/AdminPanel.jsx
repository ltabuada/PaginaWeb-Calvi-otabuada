import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useListings } from '../context/ListingsContext'
import { useEmprendimientos } from '../context/EmprendimientosContext'
import { useConsultas } from '../context/ConsultasContext'
import { storage } from '../firebase'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import MapView from '../components/MapView'
import LocationAutocomplete from '../components/LocationAutocomplete'

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
  const [toast, setToast] = useState('')
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
  const fileInputPropRef = useRef(null)
  const fileInputEmpRef = useRef(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const handleImageUpload = async (e, formSetter, setUploading, setProgress) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    setProgress(files.map(f => ({ name: f.name, progress: 0, done: false })))
    const uploadedUrls = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const storageRef = ref(storage, `imagenes/${Date.now()}_${file.name}`)
      await new Promise((resolve, reject) => {
        const task = uploadBytesResumable(storageRef, file)
        task.on(
          'state_changed',
          snap => {
            const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
            setProgress(prev => prev.map((p, idx) => idx === i ? { ...p, progress: pct } : p))
          },
          reject,
          async () => {
            const url = await getDownloadURL(task.snapshot.ref)
            uploadedUrls.push(url)
            setProgress(prev => prev.map((p, idx) => idx === i ? { ...p, progress: 100, done: true } : p))
            resolve()
          }
        )
      })
    }
    formSetter(f => ({
      ...f,
      imagenes: f.imagenes.trim() ? f.imagenes.trim() + '\n' + uploadedUrls.join('\n') : uploadedUrls.join('\n'),
    }))
    setUploading(false)
    setProgress([])
    e.target.value = ''
  }

  const handleLogout = () => {
    logout()
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

  const handleGuardar = (e) => {
    e.preventDefault()
    const imagenesArr = form.imagenes
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)

    if (imagenesArr.length === 0) {
      alert('Agregá al menos una URL de imagen.')
      return
    }

    const datos = {
      ...form,
      precio: parseInt(form.precio) || 0,
      ambientes: parseInt(form.ambientes) || 1,
      dormitorios: parseInt(form.dormitorios) || 1,
      banos: parseInt(form.banos) || 1,
      superficie: parseInt(form.superficie) || 0,
      expensas: parseInt(form.expensas) || 0,
      imagenes: imagenesArr,
    }

    if (vista === 'nueva') {
      addPropiedad(datos)
      showToast('Propiedad agregada correctamente.')
    } else {
      updatePropiedad(editId, datos)
      showToast('Propiedad actualizada correctamente.')
    }
    setVista('lista')
  }

  const handleConfirmDelete = (id) => {
    deletePropiedad(id)
    setConfirmDelete(null)
    showToast('Propiedad eliminada.')
  }

  // ── EMPRENDIMIENTOS HANDLERS ──
  const abrirNuevaEmp = () => { setEmpForm(EMPTY_EMP_FORM); setEmpEditId(null); setVista('emp-nueva') }

  const abrirEditarEmp = (e) => {
    setEmpForm({ ...e, imagenes: e.imagenes.join('\n'), precioDesde: String(e.precioDesde), superficieDesde: String(e.superficieDesde) })
    setEmpEditId(e.id)
    setVista('emp-editar')
  }

  const handleChangeEmp = (ev) => {
    const { name, value, type, checked } = ev.target
    setEmpForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleGuardarEmp = (ev) => {
    ev.preventDefault()
    const imagenesArr = empForm.imagenes.split('\n').map(s => s.trim()).filter(Boolean)
    if (imagenesArr.length === 0) { alert('Agregá al menos una URL de imagen.'); return }
    const datos = { ...empForm, precioDesde: parseInt(empForm.precioDesde) || 0, superficieDesde: parseInt(empForm.superficieDesde) || 0, imagenes: imagenesArr }
    if (vista === 'emp-nueva') { addEmprendimiento(datos); showToast('Emprendimiento agregado.') }
    else { updateEmprendimiento(empEditId, datos); showToast('Emprendimiento actualizado.') }
    setVista('emp-lista')
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
          <div className="admin-toast">
            <i className="fa-solid fa-circle-check" /> {toast}
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
                          <img src={p.imagenes[0]} alt={p.titulo} className="table-thumb" />
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
                        onChange={e => handleImageUpload(e, setForm, setUploadingProp, setUploadProgressProp)}
                      />
                      <i className="fa-solid fa-cloud-arrow-up" />
                      <span>{uploadingProp ? 'Subiendo...' : 'Hacé clic para seleccionar imágenes'}</span>
                      <small>PNG, JPG, WEBP — múltiples archivos permitidos</small>
                    </div>
                    {uploadProgressProp.length > 0 && (
                      <div className="upload-progress-list">
                        {uploadProgressProp.map((f, i) => (
                          <div key={i} className="upload-progress-item">
                            <span className="upload-filename"><i className="fa-solid fa-image" /> {f.name}</span>
                            <div className="upload-bar-wrap">
                              <div className="upload-bar" style={{ width: `${f.progress}%` }} />
                            </div>
                            <span className="upload-pct">{f.done ? <i className="fa-solid fa-circle-check" style={{color:'var(--primary)'}} /> : `${f.progress}%`}</span>
                          </div>
                        ))}
                      </div>
                    )}
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
                          <img key={i} src={url} alt={`preview ${i + 1}`} className="img-preview" onError={e => e.target.style.opacity = '0.3'} />
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
                <button type="submit" className="admin-btn-primary">
                  <i className="fa-solid fa-floppy-disk" />
                  {vista === 'nueva' ? 'Agregar propiedad' : 'Guardar cambios'}
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
                          <img src={e.imagenes[0]} alt={e.titulo} className="table-thumb" />
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
                        onChange={e => handleImageUpload(e, setEmpForm, setUploadingEmp, setUploadProgressEmp)}
                      />
                      <i className="fa-solid fa-cloud-arrow-up" />
                      <span>{uploadingEmp ? 'Subiendo...' : 'Hacé clic para seleccionar imágenes'}</span>
                      <small>PNG, JPG, WEBP — múltiples archivos permitidos</small>
                    </div>
                    {uploadProgressEmp.length > 0 && (
                      <div className="upload-progress-list">
                        {uploadProgressEmp.map((f, i) => (
                          <div key={i} className="upload-progress-item">
                            <span className="upload-filename"><i className="fa-solid fa-image" /> {f.name}</span>
                            <div className="upload-bar-wrap">
                              <div className="upload-bar" style={{ width: `${f.progress}%` }} />
                            </div>
                            <span className="upload-pct">{f.done ? <i className="fa-solid fa-circle-check" style={{color:'var(--primary)'}} /> : `${f.progress}%`}</span>
                          </div>
                        ))}
                      </div>
                    )}
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
                          <img key={i} src={url} alt={`preview ${i + 1}`} className="img-preview" onError={e => e.target.style.opacity = '0.3'} />
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
                <button type="submit" className="admin-btn-primary">
                  <i className="fa-solid fa-floppy-disk" />
                  {vista === 'emp-nueva' ? 'Agregar emprendimiento' : 'Guardar cambios'}
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
