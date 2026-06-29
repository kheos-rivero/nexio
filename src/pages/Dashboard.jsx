import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const estadoBadge = {
  pendiente:  'bg-amber-50 text-amber-800',
  confirmada: 'bg-emerald-50 text-emerald-800',
  completada: 'bg-slate-100 text-slate-600',
  cancelada:  'bg-red-50 text-red-700',
}

function getInitials(nombre) {
  return nombre?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?'
}

function getHora(fechaHora) {
  return new Date(fechaHora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function getFechaHoy() {
  return new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function Dashboard({ negocio }) {
  const [stats, setStats] = useState({ hoy: 0, pendientes: 0, completadas: 0, servicios: 0 })
  const [citasHoy, setCitasHoy] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!negocio?.id) return
    fetchData()
  }, [negocio])

  const fetchData = async () => {
    const hoy = new Date()
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString()
    const fin   = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1).toISOString()

    const [{ data: citas }, { data: servicios }] = await Promise.all([
      supabase
        .from('citas')
        .select('*, servicios(nombre, duracion_minutos)')
        .eq('negocio_id', negocio.id)
        .gte('fecha_hora', inicio)
        .lt('fecha_hora', fin)
        .order('fecha_hora'),
      supabase
        .from('servicios')
        .select('id')
        .eq('negocio_id', negocio.id)
        .eq('activo', true),
    ])

    if (citas) {
      setCitasHoy(citas)
      setStats({
        hoy:        citas.length,
        pendientes: citas.filter(c => c.estado === 'pendiente').length,
        completadas: citas.filter(c => c.estado === 'completada').length,
        servicios:  servicios?.length || 0,
      })
    }
    setLoading(false)
  }

  const statCards = [
    { label: 'Citas hoy',        value: stats.hoy,         color: 'text-nexio-violet'  },
    { label: 'Pendientes',       value: stats.pendientes,   color: 'text-amber-500'     },
    { label: 'Completadas',      value: stats.completadas,  color: 'text-emerald-600'   },
    { label: 'Servicios activos',value: stats.servicios,    color: 'text-indigo-500'    },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-base font-semibold text-slate-900">
            Buenos días, {negocio?.nombre?.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-slate-400 capitalize">{getFechaHoy()}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-nexio-violet-soft flex items-center justify-center">
          <span className="text-[11px] font-semibold text-nexio-violet">{getInitials(negocio?.nombre)}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-4 gap-3 mb-6">
          {statCards.map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-2">{label}</p>
              <p className={`text-2xl font-semibold ${color}`}>{loading ? '—' : value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">Citas de hoy</span>
            <Link to="/citas" className="text-xs text-nexio-violet hover:underline">Ver todas →</Link>
          </div>

          {loading ? (
            <p className="px-4 py-8 text-center text-sm text-slate-400">Cargando...</p>
          ) : citasHoy.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-400">No hay citas para hoy</p>
          ) : (
            citasHoy.map((cita, i) => (
              <div key={cita.id} className={`px-4 py-3 flex items-center gap-3 ${i < citasHoy.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-nexio-violet-soft flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-semibold text-nexio-violet">{getInitials(cita.cliente_nombre)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{cita.cliente_nombre}</p>
                  <p className="text-xs text-slate-400">{cita.servicios?.nombre} · {cita.servicios?.duracion_minutos} min</p>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">{getHora(cita.fecha_hora)}</span>
                <span className={`text-[10px] font-medium px-2 py-1 rounded-full flex-shrink-0 capitalize ${estadoBadge[cita.estado] || 'bg-slate-100 text-slate-600'}`}>
                  {cita.estado}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}