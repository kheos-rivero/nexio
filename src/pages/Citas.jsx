import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const ESTADOS = ['todas', 'pendiente', 'confirmada', 'completada', 'cancelada']

const estadoBadge = {
  pendiente:  'bg-amber-50 text-amber-800',
  confirmada: 'bg-violet-50 text-violet-700',
  completada: 'bg-emerald-50 text-emerald-800',
  cancelada:  'bg-red-50 text-red-700',
}

const nextEstados = {
  pendiente:  ['confirmada', 'cancelada'],
  confirmada: ['completada', 'cancelada'],
  completada: [],
  cancelada:  [],
}

const emptyForm = {
  cliente_nombre: '', cliente_email: '',
  cliente_telefono: '', servicio_id: '',
  fecha_hora: '', notas: '',
}

function formatFecha(fechaHora) {
  const d = new Date(fechaHora)
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export default function Citas({ negocio }) {
  const [citas, setCitas] = useState([])
  const [servicios, setServicios] = useState([])
  const [filtro, setFiltro] = useState('todas')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (negocio?.id) { fetchCitas(); fetchServicios() }
  }, [negocio])

  const fetchCitas = async () => {
    const { data } = await supabase
      .from('citas')
      .select('*, servicios(nombre, duracion_minutos)')
      .eq('negocio_id', negocio.id)
      .order('fecha_hora', { ascending: false })
    setCitas(data || [])
    setLoading(false)
  }

  const fetchServicios = async () => {
    const { data } = await supabase
      .from('servicios').select('id, nombre, duracion_minutos')
      .eq('negocio_id', negocio.id).eq('activo', true)
    setServicios(data || [])
  }

  const cambiarEstado = async (id, nuevoEstado) => {
    await supabase.from('citas').update({ estado: nuevoEstado }).eq('id', id)
    await fetchCitas()
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta cita?')) return
    await supabase.from('citas').delete().eq('id', id)
    await fetchCitas()
  }

  const guardar = async () => {
    if (!form.cliente_nombre || !form.servicio_id || !form.fecha_hora) return
    setGuardando(true)
    await supabase.from('citas').insert({
      negocio_id: negocio.id,
      servicio_id: form.servicio_id,
      cliente_nombre: form.cliente_nombre,
      cliente_email: form.cliente_email,
      cliente_telefono: form.cliente_telefono,
      fecha_hora: form.fecha_hora,
      estado: 'pendiente',
      notas: form.notas,
    })
    await fetchCitas()
    setGuardando(false)
    setShowForm(false)
    setForm(emptyForm)
  }

  const citasFiltradas = filtro === 'todas' ? citas : citas.filter(c => c.estado === filtro)

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <h1 className="text-base font-semibold text-slate-900">Citas</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-nexio-violet text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
        >
          + Nueva cita
        </button>
      </div>

      <div className="px-6 py-3 bg-white border-b border-slate-100 flex gap-2 flex-shrink-0">
        {ESTADOS.map(e => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize transition-colors ${
              filtro === e
                ? 'bg-nexio-violet text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <p className="text-sm text-slate-400 text-center py-12">Cargando...</p>
        ) : citasFiltradas.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-12">
            No hay citas{filtro !== 'todas' ? ` con estado "${filtro}"` : ''}.
          </p>
        ) : (
          <div className="flex flex-col gap-3 max-w-2xl">
            {citasFiltradas.map(cita => (
              <div key={cita.id} className="bg-white rounded-xl border border-slate-200 px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-800">{cita.cliente_nombre}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${estadoBadge[cita.estado] || 'bg-slate-100 text-slate-600'}`}>
                        {cita.estado}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{cita.servicios?.nombre} · {formatFecha(cita.fecha_hora)}</p>
                    {cita.cliente_telefono && <p className="text-xs text-slate-400 mt-0.5">{cita.cliente_telefono}</p>}
                    {cita.notas && <p className="text-xs text-slate-400 mt-1 italic">"{cita.notas}"</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 flex-wrap justify-end">
                    {(nextEstados[cita.estado] || []).map(siguiente => (
                      <button
                        key={siguiente}
                        onClick={() => cambiarEstado(cita.id, siguiente)}
                        className="text-[11px] text-slate-500 hover:text-nexio-violet border border-slate-200 hover:border-nexio-violet px-2 py-1 rounded-lg transition-colors capitalize"
                      >
                        → {siguiente}
                      </button>
                    ))}
                    <button
                      onClick={() => eliminar(cita.id)}
                      className="text-slate-300 hover:text-red-400 transition-colors px-2 py-1 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-auto">
            <h2 className="text-base font-semibold text-slate-900 mb-5">Nueva cita</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nombre del cliente *</label>
                <input type="text" value={form.cliente_nombre}
                  onChange={e => setForm({ ...form, cliente_nombre: e.target.value })}
                  placeholder="Nombre completo"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-nexio-violet"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                  <input type="email" value={form.cliente_email}
                    onChange={e => setForm({ ...form, cliente_email: e.target.value })}
                    placeholder="email@ejemplo.com"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-nexio-violet"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Teléfono</label>
                  <input type="tel" value={form.cliente_telefono}
                    onChange={e => setForm({ ...form, cliente_telefono: e.target.value })}
                    placeholder="600 000 000"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-nexio-violet"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Servicio *</label>
                <select value={form.servicio_id}
                  onChange={e => setForm({ ...form, servicio_id: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-nexio-violet"
                >
                  <option value="">Selecciona un servicio</option>
                  {servicios.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre} ({s.duracion_minutos} min)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Fecha y hora *</label>
                <input type="datetime-local" value={form.fecha_hora}
                  onChange={e => setForm({ ...form, fecha_hora: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-nexio-violet"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Notas</label>
                <textarea value={form.notas}
                  onChange={e => setForm({ ...form, notas: e.target.value })}
                  placeholder="Observaciones opcionales..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-nexio-violet resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowForm(false); setForm(emptyForm) }}
                className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={guardando}
                className="flex-1 bg-nexio-violet text-white text-sm font-medium py-2 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Crear cita'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}