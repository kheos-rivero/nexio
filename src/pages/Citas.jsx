import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ESTADOS = ['pendiente', 'confirmada', 'completada', 'cancelada']

const COLORES_ESTADO = {
  pendiente:   { bg: '#422006', color: '#fb923c' },
  confirmada:  { bg: '#14532d', color: '#86efac' },
  completada:  { bg: '#1e3a5f', color: '#93c5fd' },
  cancelada:   { bg: '#2d1515', color: '#f87171' }
}

export default function Citas({ negocio }) {
  const navigate = useNavigate()
  const [citas, setCitas] = useState([])
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('todas')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    cliente_nombre: '',
    cliente_telefono: '',
    cliente_email: '',
    servicio_id: '',
    fecha_hora: '',
    notas: ''
  })

  const cargarDatos = async () => {
    const [{ data: citasData }, { data: serviciosData }] = await Promise.all([
      supabase.from('citas').select('*, servicios(nombre, duracion_minutos)').eq('negocio_id', negocio.id).order('fecha_hora', { ascending: true }),
      supabase.from('servicios').select('*').eq('negocio_id', negocio.id).eq('activo', true)
    ])
    setCitas(citasData || [])
    setServicios(serviciosData || [])
    setLoading(false)
  }

  useEffect(() => { cargarDatos() }, [])

  const abrirForm = () => {
    setForm({ cliente_nombre: '', cliente_telefono: '', cliente_email: '', servicio_id: '', fecha_hora: '', notas: '' })
    setError(null)
    setMostrarForm(true)
  }

  const cancelar = () => { setMostrarForm(false); setError(null) }

  const guardar = async () => {
    if (!form.cliente_nombre.trim()) { setError('El nombre del cliente es obligatorio'); return }
    if (!form.servicio_id) { setError('Selecciona un servicio'); return }
    if (!form.fecha_hora) { setError('La fecha y hora son obligatorias'); return }
    setGuardando(true)
    setError(null)

    const { error } = await supabase.from('citas').insert({
      negocio_id: negocio.id,
      servicio_id: form.servicio_id,
      cliente_nombre: form.cliente_nombre.trim(),
      cliente_telefono: form.cliente_telefono.trim(),
      cliente_email: form.cliente_email.trim(),
      fecha_hora: new Date(form.fecha_hora).toISOString(),
      notas: form.notas.trim(),
      estado: 'pendiente'
    })

    if (error) {
      setError('Error al guardar. Inténtalo de nuevo.')
    } else {
      setMostrarForm(false)
      cargarDatos()
    }
    setGuardando(false)
  }

  const cambiarEstado = async (cita, nuevoEstado) => {
    await supabase.from('citas').update({ estado: nuevoEstado }).eq('id', cita.id)
    cargarDatos()
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta cita?')) return
    await supabase.from('citas').delete().eq('id', id)
    cargarDatos()
  }

  const citasFiltradas = filtroEstado === 'todas' ? citas : citas.filter(c => c.estado === filtroEstado)

  const formatFecha = (fechaISO) => {
    const d = new Date(fechaISO)
    return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }) +
      ' · ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: 'white', fontFamily: 'sans-serif' }}>

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 2rem', borderBottom: '1px solid #222' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.25rem' }}>←</button>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Citas</h1>
        <span style={{ color: '#555', fontSize: '0.875rem' }}>{negocio.nombre}</span>
      </header>

      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>

        {/* Botón nueva cita */}
        {!mostrarForm && (
          <button onClick={abrirForm} style={{
            background: 'white', color: 'black', border: 'none', padding: '0.75rem 1.5rem',
            borderRadius: '8px', cursor: 'pointer', fontWeight: 600, marginBottom: '2rem'
          }}>
            + Nueva cita
          </button>
        )}

        {/* Formulario nueva cita */}
        {mostrarForm && (
          <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1.5rem' }}>Nueva cita</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: '#aaa' }}>Nombre del cliente *</label>
                <input type="text" placeholder="Ej: Carlos García"
                  value={form.cliente_nombre} onChange={e => setForm(p => ({ ...p, cliente_nombre: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem', background: '#111', border: '1px solid #333', borderRadius: '6px', color: 'white', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: '#aaa' }}>Teléfono</label>
                <input type="tel" placeholder="Ej: 612 345 678"
                  value={form.cliente_telefono} onChange={e => setForm(p => ({ ...p, cliente_telefono: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem', background: '#111', border: '1px solid #333', borderRadius: '6px', color: 'white', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: '#aaa' }}>Servicio *</label>
                <select value={form.servicio_id} onChange={e => setForm(p => ({ ...p, servicio_id: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem', background: '#111', border: '1px solid #333', borderRadius: '6px', color: 'white', boxSizing: 'border-box' }}>
                  <option value="">Selecciona un servicio</option>
                  {servicios.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre} — {s.duracion_minutos} min{s.precio ? ` · ${s.precio}€` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: '#aaa' }}>Fecha y hora *</label>
                <input type="datetime-local"
                  value={form.fecha_hora} onChange={e => setForm(p => ({ ...p, fecha_hora: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem', background: '#111', border: '1px solid #333', borderRadius: '6px', color: 'white', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: '#aaa' }}>Notas internas</label>
              <textarea placeholder="Ej: Cliente prefiere tijera, alérgico a ciertos productos..."
                value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
                rows={2} style={{ width: '100%', padding: '0.6rem', background: '#111', border: '1px solid #333', borderRadius: '6px', color: 'white', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>

            {error && <p style={{ color: '#f87171', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={guardar} disabled={guardando} style={{ background: 'white', color: 'black', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                {guardando ? 'Guardando...' : 'Guardar cita'}
              </button>
              <button onClick={cancelar} style={{ background: 'none', border: '1px solid #444', color: '#aaa', padding: '0.6rem 1.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Filtros de estado */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {['todas', ...ESTADOS].map(estado => (
            <button key={estado} onClick={() => setFiltroEstado(estado)} style={{
              padding: '0.35rem 0.9rem', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '0.8rem',
              background: filtroEstado === estado ? 'white' : '#1a1a1a',
              color: filtroEstado === estado ? 'black' : '#888'
            }}>
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </button>
          ))}
        </div>

        {/* Lista de citas */}
        {loading ? (
          <p style={{ color: '#666' }}>Cargando citas...</p>
        ) : citasFiltradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#555' }}>
            <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>📅</p>
            <p>{filtroEstado === 'todas' ? 'Aún no tienes citas. ¡Crea la primera!' : `No hay citas ${filtroEstado}s.`}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {citasFiltradas.map(cita => {
              const col = COLORES_ESTADO[cita.estado]
              return (
                <div key={cita.id} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{cita.cliente_nombre}</div>
                      <div style={{ color: '#888', fontSize: '0.875rem', marginBottom: '0.2rem' }}>
                        {cita.servicios?.nombre} · {formatFecha(cita.fecha_hora)}
                      </div>
                      {cita.cliente_telefono && <div style={{ color: '#666', fontSize: '0.8rem' }}>{cita.cliente_telefono}</div>}
                      {cita.notas && <div style={{ color: '#555', fontSize: '0.8rem', marginTop: '0.25rem', fontStyle: 'italic' }}>📝 {cita.notas}</div>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <span style={{ background: col.bg, color: col.color, padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500 }}>
                        {cita.estado}
                      </span>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {ESTADOS.filter(e => e !== cita.estado).map(e => (
                          <button key={e} onClick={() => cambiarEstado(cita, e)} style={{
                            background: 'none', border: '1px solid #333', color: '#888',
                            padding: '0.2rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem'
                          }}>
                            → {e}
                          </button>
                        ))}
                        <button onClick={() => eliminar(cita.id)} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer' }}>🗑</button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}