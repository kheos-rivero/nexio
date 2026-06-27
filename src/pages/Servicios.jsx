import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Servicios({ negocio }) {
  const navigate = useNavigate()
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', duracion_minutos: 30, precio: '' })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const cargarServicios = async () => {
    const { data } = await supabase
      .from('servicios')
      .select('*')
      .eq('negocio_id', negocio.id)
      .order('created_at', { ascending: true })
    setServicios(data || [])
    setLoading(false)
  }

  useEffect(() => { cargarServicios() }, [])

  const abrirFormNuevo = () => {
    setEditando(null)
    setForm({ nombre: '', duracion_minutos: 30, precio: '' })
    setError(null)
    setMostrarForm(true)
  }

  const abrirFormEditar = (servicio) => {
    setEditando(servicio)
    setForm({ nombre: servicio.nombre, duracion_minutos: servicio.duracion_minutos, precio: servicio.precio || '' })
    setError(null)
    setMostrarForm(true)
  }

  const cancelar = () => {
    setMostrarForm(false)
    setEditando(null)
    setError(null)
  }

  const guardar = async () => {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    if (!form.duracion_minutos || form.duracion_minutos < 5) { setError('La duración mínima es 5 minutos'); return }
    setGuardando(true)
    setError(null)

    const datos = {
      nombre: form.nombre.trim(),
      duracion_minutos: parseInt(form.duracion_minutos),
      precio: form.precio ? parseFloat(form.precio) : null,
      negocio_id: negocio.id
    }

    let err
    if (editando) {
      const res = await supabase.from('servicios').update(datos).eq('id', editando.id)
      err = res.error
    } else {
      const res = await supabase.from('servicios').insert(datos)
      err = res.error
    }

    if (err) {
      setError('Error al guardar. Inténtalo de nuevo.')
    } else {
      setMostrarForm(false)
      setEditando(null)
      cargarServicios()
    }
    setGuardando(false)
  }

  const toggleActivo = async (servicio) => {
    await supabase.from('servicios').update({ activo: !servicio.activo }).eq('id', servicio.id)
    cargarServicios()
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este servicio?')) return
    await supabase.from('servicios').delete().eq('id', id)
    cargarServicios()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: 'white', fontFamily: 'sans-serif' }}>

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 2rem', borderBottom: '1px solid #222' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.25rem' }}>←</button>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Servicios</h1>
        <span style={{ color: '#555', fontSize: '0.875rem' }}>{negocio.nombre}</span>
      </header>

      <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>

        {/* Botón nuevo servicio */}
        {!mostrarForm && (
          <button onClick={abrirFormNuevo} style={{
            background: 'white', color: 'black', border: 'none', padding: '0.75rem 1.5rem',
            borderRadius: '8px', cursor: 'pointer', fontWeight: 600, marginBottom: '2rem'
          }}>
            + Nuevo servicio
          </button>
        )}

        {/* Formulario */}
        {mostrarForm && (
          <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1.5rem' }}>{editando ? 'Editar servicio' : 'Nuevo servicio'}</h3>

            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: '#aaa' }}>Nombre *</label>
            <input
              type="text" placeholder="Ej: Corte de pelo"
              value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.6rem', background: '#111', border: '1px solid #333', borderRadius: '6px', color: 'white', boxSizing: 'border-box' }}
            />

            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: '#aaa' }}>Duración (minutos) *</label>
            <input
              type="number" min="5" step="5"
              value={form.duracion_minutos} onChange={e => setForm(p => ({ ...p, duracion_minutos: e.target.value }))}
              style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.6rem', background: '#111', border: '1px solid #333', borderRadius: '6px', color: 'white', boxSizing: 'border-box' }}
            />

            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: '#aaa' }}>Precio (€) — opcional</label>
            <input
              type="number" min="0" step="0.5" placeholder="Ej: 15"
              value={form.precio} onChange={e => setForm(p => ({ ...p, precio: e.target.value }))}
              style={{ display: 'block', width: '100%', marginBottom: '1.5rem', padding: '0.6rem', background: '#111', border: '1px solid #333', borderRadius: '6px', color: 'white', boxSizing: 'border-box' }}
            />

            {error && <p style={{ color: '#f87171', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={guardar} disabled={guardando} style={{ background: 'white', color: 'black', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={cancelar} style={{ background: 'none', border: '1px solid #444', color: '#aaa', padding: '0.6rem 1.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de servicios */}
        {loading ? (
          <p style={{ color: '#666' }}>Cargando servicios...</p>
        ) : servicios.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#555' }}>
            <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>✂️</p>
            <p>Aún no tienes servicios. ¡Crea el primero!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {servicios.map(s => (
              <div key={s.id} style={{
                background: '#1a1a1a', border: `1px solid ${s.activo ? '#2a2a2a' : '#1f1f1f'}`,
                borderRadius: '10px', padding: '1rem 1.25rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                opacity: s.activo ? 1 : 0.5
              }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{s.nombre}</div>
                  <div style={{ color: '#888', fontSize: '0.875rem' }}>
                    {s.duracion_minutos} min
                    {s.precio ? ` · ${parseFloat(s.precio).toFixed(2)}€` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button onClick={() => toggleActivo(s)} style={{
                    background: s.activo ? '#166534' : '#333', border: 'none', color: s.activo ? '#86efac' : '#888',
                    padding: '0.3rem 0.75rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.75rem'
                  }}>
                    {s.activo ? 'Activo' : 'Inactivo'}
                  </button>
                  <button onClick={() => abrirFormEditar(s)} style={{ background: 'none', border: '1px solid #333', color: '#aaa', padding: '0.3rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>
                    Editar
                  </button>
                  <button onClick={() => eliminar(s.id)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '1rem' }}>
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}