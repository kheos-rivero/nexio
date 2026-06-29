import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabasePublico } from '../lib/supabase'

const formatearFecha = (f) => {
  if (!f) return ''
  const [y, m, d] = f.split('-')
  return `${d}/${m}/${y}`
}

const horaAMinutos = (hora) => {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

const minutosAHora = (min) => {
  const h = Math.floor(min / 60).toString().padStart(2, '0')
  const m = (min % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

const INTERVALO = 30

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
  const [horasDisponibles, setHorasDisponibles] = useState([])
  const [loadingHoras, setLoadingHoras] = useState(false)
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '' })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cargar = async () => {
      const { data: negocioData } = await supabasePublico
        .from('negocios').select('*').eq('slug', slug).single()
      if (!negocioData) { setNotFound(true); setLoading(false); return }
      const { data: serviciosData } = await supabasePublico
        .from('servicios').select('*')
        .eq('negocio_id', negocioData.id).eq('activo', true)
      setNegocio(negocioData)
      setServicios(serviciosData || [])
      setLoading(false)
    }
    cargar()
  }, [slug])

  useEffect(() => {
    if (fecha && servicioSeleccionado && negocio) {
      calcularHorasDisponibles()
    }
  }, [fecha, servicioSeleccionado])

  const calcularHorasDisponibles = async () => {
    setLoadingHoras(true)
    setHora('')

    const diaSemana = (new Date(fecha + 'T00:00:00').getDay() + 6) % 7

    const { data: horario } = await supabasePublico
      .from('horarios')
      .select('*')
      .eq('negocio_id', negocio.id)
      .eq('dia_semana', diaSemana)
      .eq('activo', true)
      .single()

    if (!horario) {
      setHorasDisponibles([])
      setLoadingHoras(false)
      return
    }

    const inicioMin = horaAMinutos(horario.hora_inicio)
    const finMin = horaAMinutos(horario.hora_fin)
    const duracion = servicioSeleccionado.duracion_minutos

    const inicio = new Date(fecha + 'T00:00:00').toISOString()
    const fin = new Date(fecha + 'T23:59:59').toISOString()

    const { data: citasDelDia } = await supabasePublico
      .from('citas')
      .select('fecha_hora, servicios(duracion_minutos)')
      .eq('negocio_id', negocio.id)
      .gte('fecha_hora', inicio)
      .lte('fecha_hora', fin)
      .neq('estado', 'cancelada')

    const franjasBloqueadas = (citasDelDia || []).map(c => {
      const citaDate = new Date(c.fecha_hora)
      const citaMin = citaDate.getHours() * 60 + citaDate.getMinutes()
      return { inicio: citaMin, fin: citaMin + (c.servicios?.duracion_minutos || 30) }
    })

    const horas = []
    for (let min = inicioMin; min + duracion <= finMin; min += INTERVALO) {
      const ocupada = franjasBloqueadas.some(f => min < f.fin && min + duracion > f.inicio)
      if (!ocupada) horas.push(minutosAHora(min))
    }

    setHorasDisponibles(horas)
    setLoadingHoras(false)
  }

  const confirmarReserva = async () => {
    if (!form.nombre.trim()) { setError('Tu nombre es obligatorio'); return }
    setGuardando(true)
    setError(null)

    const fechaHora = new Date(`${fecha}T${hora}`).toISOString()
    const { error: err } = await supabasePublico.from('citas').insert({
      negocio_id: negocio.id,
      servicio_id: servicioSeleccionado.id,
      cliente_nombre: form.nombre.trim(),
      cliente_telefono: form.telefono.trim(),
      cliente_email: form.email.trim(),
      fecha_hora: fechaHora,
      estado: 'pendiente'
    })

    if (err) {
      setError('Error al confirmar la reserva. Inténtalo de nuevo.')
      setGuardando(false)
      return
    }

    if (form.email.trim()) {
      try {
        await fetch(
          'https://ytaiwsttqtooirzfsxqk.supabase.co/functions/v1/enviar-confirmacion',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cliente_nombre: form.nombre.trim(),
              cliente_email: form.email.trim(),
              negocio_nombre: negocio.nombre,
              servicio_nombre: servicioSeleccionado.nombre,
              fecha: formatearFecha(fecha),
              hora,
            }),
          }
        )
      } catch (e) {
        console.error('Error enviando email:', e)
      }
    }

    setPaso(4)
    setGuardando(false)
  }

  const hoy = new Date().toISOString().split('T')[0]

  const inputClass = "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-nexio-violet transition-colors"
  const labelClass = "block text-xs font-medium text-slate-600 mb-1"

  if (loading) return (
    <div className="min-h-screen bg-nexio-bg flex items-center justify-center">
      <p className="text-sm text-slate-400">Cargando...</p>
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-nexio-bg flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-sm w-full">
        <p className="text-2xl mb-3">🔍</p>
        <h2 className="text-base font-semibold text-slate-800 mb-1">Negocio no encontrado</h2>
        <p className="text-sm text-slate-400">El enlace que has usado no es válido.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-nexio-bg flex flex-col items-center justify-center px-4 py-10">

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{negocio.nombre}</h1>
        <p className="text-sm text-slate-400 mt-1">
          {negocio.categoria}{negocio.direccion ? ` · ${negocio.direccion}` : ''}
        </p>
        {negocio.descripcion && (
          <p className="text-sm text-slate-500 mt-1">{negocio.descripcion}</p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md p-6">

        {paso < 4 && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  paso > n ? 'bg-emerald-100 text-emerald-700'
                  : paso === n ? 'bg-nexio-violet text-white'
                  : 'bg-slate-100 text-slate-400'
                }`}>
                  {paso > n ? '✓' : n}
                </div>
                {n < 3 && <div className={`w-8 h-px ${paso > n ? 'bg-emerald-200' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>
        )}

        {paso === 1 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-800 text-center mb-4">
              ¿Qué servicio necesitas?
            </h3>
            {servicios.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">
                Este negocio aún no tiene servicios disponibles.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {servicios.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setServicioSeleccionado(s); setPaso(2) }}
                    className="w-full border border-slate-200 hover:border-nexio-violet rounded-xl px-4 py-3 text-left transition-colors group"
                  >
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-nexio-violet transition-colors">
                      {s.nombre}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {s.duracion_minutos} min{s.precio ? ` · ${parseFloat(s.precio).toFixed(2)}€` : ''}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {paso === 2 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-800 text-center mb-1">
              ¿Cuándo te viene bien?
            </h3>
            <p className="text-xs text-slate-400 text-center mb-4">
              {servicioSeleccionado.nombre} · {servicioSeleccionado.duracion_minutos} min
            </p>

            <label className={labelClass}>Fecha</label>
            <input
              type="date" min={hoy} value={fecha}
              onChange={e => { setFecha(e.target.value); setHora('') }}
              className={`${inputClass} mb-4`}
            />

            {fecha && (
              <>
                <label className={`${labelClass} mb-2`}>Hora</label>
                {loadingHoras ? (
                  <p className="text-sm text-slate-400 text-center py-4">Comprobando disponibilidad...</p>
                ) : horasDisponibles.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 mb-4">
                    <p className="text-sm text-amber-700 text-center">
                      No hay horas disponibles para este día. Prueba con otra fecha.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {horasDisponibles.map(h => (
                      <button
                        key={h}
                        onClick={() => setHora(h)}
                        className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                          hora === h
                            ? 'bg-nexio-violet text-white border-nexio-violet'
                            : 'border-slate-200 text-slate-600 hover:border-nexio-violet hover:text-nexio-violet'
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setPaso(1)}
                className="flex-1 border border-slate-200 text-slate-500 text-sm py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                ← Volver
              </button>
              <button
                onClick={() => { if (fecha && hora) setPaso(3) }}
                disabled={!fecha || !hora}
                className="flex-[2] bg-nexio-violet text-white text-sm font-medium py-2.5 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continuar →
              </button>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-800 text-center mb-1">Tus datos</h3>
            <p className="text-xs text-slate-400 text-center mb-4">
              {servicioSeleccionado.nombre} · {formatearFecha(fecha)} · {hora}
            </p>
            <div className="flex flex-col gap-3">
              <div>
                <label className={labelClass}>Tu nombre *</label>
                <input type="text" placeholder="Ej: Carlos García"
                  value={form.nombre}
                  onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Teléfono</label>
                <input type="tel" placeholder="Ej: 612 345 678"
                  value={form.telefono}
                  onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" placeholder="Ej: carlos@email.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>
            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-3">
                {error}
              </p>
            )}
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setPaso(2)}
                className="flex-1 border border-slate-200 text-slate-500 text-sm py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                ← Volver
              </button>
              <button
                onClick={confirmarReserva}
                disabled={guardando}
                className="flex-[2] bg-nexio-violet text-white text-sm font-medium py-2.5 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                {guardando ? 'Confirmando...' : 'Confirmar reserva'}
              </button>
            </div>
          </div>
        )}

        {paso === 4 && (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-emerald-600 text-2xl">✓</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">¡Reserva confirmada!</h3>
            <p className="text-sm text-slate-500">{servicioSeleccionado.nombre}</p>
            <p className="text-sm text-slate-500 mb-4">{formatearFecha(fecha)} · {hora}</p>
            <p className="text-xs text-slate-400">
              El negocio se pondrá en contacto contigo para confirmar.
            </p>
          </div>
        )}

      </div>

      <p className="text-center text-xs text-slate-400 mt-6">
        Reservas gestionadas con <span className="text-nexio-violet font-medium">nexio</span>
      </p>
    </div>
  )
}