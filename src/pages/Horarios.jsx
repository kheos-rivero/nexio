import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const DEFAULTS = [
  { dia_semana: 0, hora_inicio: '09:00', hora_fin: '19:00', activo: true },
  { dia_semana: 1, hora_inicio: '09:00', hora_fin: '19:00', activo: true },
  { dia_semana: 2, hora_inicio: '09:00', hora_fin: '19:00', activo: true },
  { dia_semana: 3, hora_inicio: '09:00', hora_fin: '19:00', activo: true },
  { dia_semana: 4, hora_inicio: '09:00', hora_fin: '19:00', activo: true },
  { dia_semana: 5, hora_inicio: '09:00', hora_fin: '14:00', activo: true },
  { dia_semana: 6, hora_inicio: '09:00', hora_fin: '14:00', activo: false },
]

export default function Horarios({ negocio }) {
  const [horarios, setHorarios] = useState(DEFAULTS.map(d => ({ ...d })))
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [exito, setExito] = useState(false)

  useEffect(() => { if (negocio?.id) fetchHorarios() }, [negocio])

  const fetchHorarios = async () => {
    const { data } = await supabase
      .from('horarios')
      .select('*')
      .eq('negocio_id', negocio.id)
      .order('dia_semana')

    if (data && data.length === 7) {
      setHorarios(data)
    } else if (!data || data.length === 0) {
      await crearDefaults()
    }
    setLoading(false)
  }

  const crearDefaults = async () => {
    const rows = DEFAULTS.map(d => ({ ...d, negocio_id: negocio.id }))
    const { data } = await supabase.from('horarios').insert(rows).select()
    if (data) setHorarios(data)
  }

  const actualizar = (dia_semana, campo, valor) => {
    setHorarios(prev => prev.map(h =>
      h.dia_semana === dia_semana ? { ...h, [campo]: valor } : h
    ))
  }

  const guardar = async () => {
    setGuardando(true)
    setExito(false)

    await Promise.all(horarios.map(h =>
      supabase.from('horarios')
        .update({ hora_inicio: h.hora_inicio, hora_fin: h.hora_fin, activo: h.activo })
        .eq('negocio_id', negocio.id)
        .eq('dia_semana', h.dia_semana)
    ))

    setGuardando(false)
    setExito(true)
    setTimeout(() => setExito(false), 3000)
  }

  if (loading) return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 bg-white border-b border-slate-200 flex-shrink-0">
        <h1 className="text-base font-semibold text-slate-900">Horarios</h1>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-slate-400">Cargando...</p>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Horarios</h1>
          <p className="text-xs text-slate-400 mt-0.5">Configura cuándo está abierto tu negocio</p>
        </div>
        <button
          onClick={guardar}
          disabled={guardando}
          className="bg-nexio-violet text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-lg">

          {exito && (
            <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 mb-4">
              ✓ Horarios guardados correctamente
            </p>
          )}

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {horarios.map((h, i) => (
              <div
                key={h.dia_semana}
                className={`flex items-center gap-4 px-5 py-4 ${
                  i < horarios.length - 1 ? 'border-b border-slate-100' : ''
                }`}
              >
                <button
                  onClick={() => actualizar(h.dia_semana, 'activo', !h.activo)}
                  className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 relative ${
                    h.activo ? 'bg-nexio-violet' : 'bg-slate-200'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    h.activo ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>

                <span className={`text-sm font-medium w-24 flex-shrink-0 ${
                  h.activo ? 'text-slate-800' : 'text-slate-400'
                }`}>
                  {DIAS[h.dia_semana]}
                </span>

                {h.activo ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={h.hora_inicio}
                      onChange={e => actualizar(h.dia_semana, 'hora_inicio', e.target.value)}
                      className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-nexio-violet transition-colors"
                    />
                    <span className="text-slate-400 text-sm">—</span>
                    <input
                      type="time"
                      value={h.hora_fin}
                      onChange={e => actualizar(h.dia_semana, 'hora_fin', e.target.value)}
                      className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-nexio-violet transition-colors"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-slate-400 flex-1">Cerrado</span>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400 mt-3 px-1">
            Los horarios afectan a las horas disponibles en tu página de reservas.
          </p>

        </div>
      </div>
    </div>
  )
}