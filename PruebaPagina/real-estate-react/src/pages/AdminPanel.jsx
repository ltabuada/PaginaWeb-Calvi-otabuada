import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useListings } from '../context/ListingsContext'
import { useEmprendimientos } from '../context/EmprendimientosContext'

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
  superficie: ''
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

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
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
                    <input name="ubicacion" value={form.ubicacion} onChange={handleChange} placeholder="Ej: Palermo, Buenos Aires" required />
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
                    <label>URLs de imágenes (una por línea) *</label>
                    <textarea
                      name="imagenes"
                      value={form.imagenes}
                      onChange={handleChange}
                      placeholder={"https://images.unsplash.com/photo-xxx?w=800\nhttps://images.unsplash.com/photo-yyy?w=800"}
                      rows={4}
                      required
                    />
                    <span className="form-hint">
                      <i className="fa-solid fa-circle-info" /> Podés usar URLs de Unsplash, Cloudinary, o cualquier imagen pública.
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
                    <input name="ubicacion" value={empForm.ubicacion} onChange={handleChangeEmp} placeholder="Ej: Palermo, Buenos Aires" required />
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
                    <label>URLs de imágenes (una por línea) *</label>
                    <textarea name="imagenes" value={empForm.imagenes} onChange={handleChangeEmp} placeholder="https://..." rows={4} required />
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
    </div>
  )
}
