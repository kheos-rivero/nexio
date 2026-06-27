import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabasePublico } from '../lib/supabase'

const HORAS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
               '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30']

export default function ReservaPublica() {
  const { slug } = useParams()
  const [negocio, setNegocio] = useState(null)
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [paso, setPaso] = useState(1)
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null)
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '' })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cargar = async () => {
      const { data: negocioData } = await supabasePublico
        .from('negocios')
        .select('*')
        .eq('slug', slug)
        .single()

      if (!negocioData) { setNotFound(true); setLoading(false); return }

      const { data: serviciosData } = await supabasePublico
        .from('servicios')
        .select('*')
        .eq('negocio_id', negocioData.id)
        .eq('activo', true)

      setNegocio(negocioData)
      setServicios(serviciosData || [])
      setLoading(false)
    }
    cargar()
  }, [slug])

  const confirmarReserva = async () => {
    if (!form.nombre.trim()) { setError('Tu nombre es obligatorio'); return }
    setGuardando(true)
    setError(null)

    const fechaHora = new Date(`${fecha}T${hora}`).toISOString()

    const { error } = await supabasePublico.from('citas').insert({
      negocio_id: negocio.id,
      servicio_id: servicioSeleccionado.id,
      cliente_nombre: form.nombre.trim(),
      cliente_telefono: form.telefono.trim(),
      cliente_email: form.email.trim(),
      fecha_hora: fechaHora,
      estado: 'pendiente'
    })

    if (error) {
      setError('Error al confirmar la reserva. Inténtalo de nuevo.')
    } else {
      setPaso(4)
    }
    setGuardando(false)
  }

  const hoy = new Date().toISOString().split('T')[0]

  if (loading) return <div style={estilos.pagina}><p style={{ color: '#888' }}>Cargando...</p></div>
  if (notFound) return (
    <div style={estilos.pagina}>
      <div style={estilos.card}>
        <h2 style={{ color: 'white' }}>Negocio no encontrado</h2>
        <p style={{ color: '#888' }}>El enlace que has usado no es válido.</p>
      </div>
    </div>
  )

  return (
    <div style={estilos.pagina}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'white', margin: '0 0 0.25rem', fontSize: '1.75rem' }}>{negocio.nombre}</h1>
        <p style={{ color: '#888', margin: 0 }}>
          {negocio.categoria}{negocio.direccion ? ` · ${negocio.direccion}` : ''}
        </p>
        {negocio.descripcion && <p style={{ color: '#666', margin: '0.5rem 0 0', fontSize: '0.875rem' }}>{negocio.descripcion}</p>}
      </div>

      <div style={estilos.card}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 600,
              background: paso > n ? '#166534' : paso === n ? 'white' : '#2a2a2a',
              color: paso > n ? '#86efac' : paso === n ? 'black' : '#555'
            }}>{paso > n ? '✓' : n}</div>
          ))}
        </div>

        {paso === 1 && (
          <div>
            <h3 style={{ color: 'white', margin: '0 0 1.25rem', textAlign: 'center' }}>¿Qué servicio necesitas?</h3>
            {servicios.length === 0 ? (
              <p style={{ color: '#888', textAlign: 'center' }}>Este negocio aún no tiene servicios disponibles.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {servicios.map(s => (
                  <button key={s.id} onClick={() => { setServicioSeleccionado(s); setPaso(2) }} style={{
                    background: '#111', border: '1px solid #333', borderRadius: '10px',
                    padding: '1rem 1.25rem', cursor: 'pointer', textAlign: 'left', color: 'white'
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#555'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#333'}
                  >
                    <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{s.nombre}</div>
                    <div style={{ color: '#888', fontSize: '0.875rem' }}>
                      {s.duracion_minutos} min{s.precio ? ` · ${parseFloat(s.precio).toFixed(2)}€` : ''}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {paso === 2 && (
          <div>
            <h3 style={{ color: 'white', margin: '0 0 0.5rem', textAlign: 'center' }}>¿Cuándo te viene bien?</h3>
            <p style={{ color: '#888', textAlign: 'center', margin: '0 0 1.5rem', fontSize: '0.875rem' }}>
              {servicioSeleccionado.nombre} · {servicioSeleccionado.duracion_minutos} min
            </p>
            <label style={{ display: 'block', color: '#aaa', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Fecha</label>
            <input type="date" min={hoy} value={fecha} onChange={e => setFecha(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', background: '#111', border: '1px solid #333', borderRadius: '6px', color: 'white', marginBottom: '1.25rem', boxSizing: 'border-box' }}
            />
            {fecha && (
              <>
                <label style={{ display: 'block', color: '#aaa', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Hora</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {HORAS.map(h => (
                    <button key={h} onClick={() => setHora(h)} style={{
                      padding: '0.5rem', borderRadius: '6px', border: '1px solid',
                      borderColor: hora === h ? 'white' : '#333',
                      background: hora === h ? 'white' : '#111',
                      color: hora === h ? 'black' : '#aaa',
                      cursor: 'pointer', fontSize: '0.875rem'
                    }}>{h}</button>
                  ))}
                </div>
              </>
            )}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setPaso(1)} style={{ flex: 1, padding: '0.7rem', background: 'none', border: '1px solid #333', color: '#888', borderRadius: '8px', cursor: 'pointer' }}>
                ← Volver
              </button>
              <button onClick={() => { if (fecha && hora) setPaso(3) }} disabled={!fecha || !hora}
                style={{ flex: 2, padding: '0.7rem', background: fecha && hora ? 'white' : '#2a2a2a', color: fecha && hora ? 'black' : '#555', border: 'none', borderRadius: '8px', cursor: fecha && hora ? 'pointer' : 'default', fontWeight: 600 }}>
                Continuar →
              </button>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div>
            <h3 style={{ color: 'white', margin: '0 0 0.5rem', textAlign: 'center' }}>Tus datos</h3>
            <p style={{ color: '#888', textAlign: 'center', margin: '0 0 1.5rem', fontSize: '0.875rem' }}>
              {servicioSeleccionado.nombre} · {fecha} · {hora}
            </p>
            <label style={{ display: 'block', color: '#aaa', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Tu nombre *</label>
            <input type="text" placeholder="Ej: Carlos García"
              value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem', background: '#111', border: '1px solid #333', borderRadius: '6px', color: 'white', marginBottom: '1rem', boxSizing: 'border-box' }}
            />
            <label style={{ display: 'block', color: '#aaa', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Teléfono</label>
            <input type="tel" placeholder="Ej: 612 345 678"
              value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem', background: '#111', border: '1px solid #333', borderRadius: '6px', color: 'white', marginBottom: '1rem', boxSizing: 'border-box' }}
            />
            <label style={{ display: 'block', color: '#aaa', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Email</label>
            <input type="email" placeholder="Ej: carlos@email.com"
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem', background: '#111', border: '1px solid #333', borderRadius: '6px', color: 'white', marginBottom: '1.5rem', boxSizing: 'border-box' }}
            />
            {error && <p style={{ color: '#f87171', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setPaso(2)} style={{ flex: 1, padding: '0.7rem', background: 'none', border: '1px solid #333', color: '#888', borderRadius: '8px', cursor: 'pointer' }}>
                ← Volver
              </button>
              <button onClick={confirmarReserva} disabled={guardando}
                style={{ flex: 2, padding: '0.7rem', background: 'white', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                {guardando ? 'Confirmando...' : 'Confirmar reserva'}
              </button>
            </div>
          </div>
        )}

        {paso === 4 && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ color: 'white', margin: '0 0 0.5rem' }}>¡Reserva confirmada!</h3>
            <p style={{ color: '#888', margin: '0 0 0.25rem' }}>{servicioSeleccionado.nombre}</p>
            <p style={{ color: '#888', margin: '0 0 1.5rem' }}>{fecha} · {hora}</p>
            <p style={{ color: '#666', fontSize: '0.875rem' }}>El negocio se pondrá en contacto contigo para confirmar.</p>
          </div>
        )}
      </div>

      <p style={{ textAlign: 'center', color: '#444', fontSize: '0.75rem', marginTop: '2rem' }}>
        Reservas gestionadas con <strong style={{ color: '#666' }}>Nexio</strong>
      </p>
    </div>
  )
}

const estilos = {
  pagina: {
    minHeight: '100vh', background: '#0a0a0a', display: 'flex',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '2rem', fontFamily: 'sans-serif'
  },
  card: {
    background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px',
    padding: '2rem', width: '100%', maxWidth: '480px'
  }
}