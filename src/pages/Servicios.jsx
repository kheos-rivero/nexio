import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const emptyForm = { nombre: '', duracion_minutos: 30, precio: '' }

export default function Servicios({ negocio }) {
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => { if (negocio?.id) fetchServicios() }, [negocio])

  const fetchServicios = async () => {
    const { data } = await supabase
      .from('servicios').select('*')
      .eq('negocio_id', negocio.id).order('created_at')
    setServicios(data || [])
    setLoading(false)
  }

  const abrirNuevo = () => { setEditando(null); setForm(emptyForm); setShowForm(true) }
  const abrirEditar = (s) => {
    setEditando(s.id)
    setForm({ nombre: s.nombre, duracion_minutos: s.duracion_minutos, precio: s.precio })
    setShowForm(true)
  }
  const cerrarForm = () => { setShowForm(false); setEditando(null); setForm(emptyForm) }

  const guardar = async () => {
    if (!form.nombre || !form.precio) return
    setGuardando(true)
    if (editando) {
      await supabase.from('servicios').update({
        nombre: form.nombre,
        duracion_minutos: Number(form.duracion_minutos),
        precio: Number(form.precio),
      }).eq('id', editando)
    } else {
      await supabase.from('servicios').insert({
        negocio_id: negocio.id,
        nombre: form.nombre,
        duracion_minutos: Number(form.duracion_minutos),
        precio: Number(form.precio),
        activo: true,
      })
    }
    await fetchServicios()
    setGuardando(false)
    cerrarForm()
  }

  const toggleActivo = async (s) => {
    await supabase.from('servicios').update({ activo: !s.activo }).eq('id', s.id)
    await fetchServicios()
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este servicio?')) return
    await supabase.from('servicios').delete().eq('id', id)
    await fetchServicios()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <h1 className="text-base font-semibold text-slate-900">Servicios</h1>
        <button
          onClick={abrirNuevo}
          className="bg-nexio-violet text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
        >
          + Nuevo servicio
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <p className="text-sm text-slate-400 text-center py-12">Cargando...</p>
        ) : servicios.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-sm">Aún no tienes servicios.</p>
            <button onClick={abrirNuevo} className="mt-3 text-nexio-violet text-sm hover:underline">
              Crea tu primer servicio →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-2xl">
            {servicios.map(s => (
              <div key={s.id} className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{s.nombre}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.duracion_minutos} min · {Number(s.precio).toFixed(2)}€</p>
                </div>
                <button
                  onClick={() => toggleActivo(s)}
                  className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                    s.activo
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {s.activo ? 'Activo' : 'Inactivo'}
                </button>
                <button
                  onClick={() => abrirEditar(s)}
                  className="text-xs text-slate-400 hover:text-nexio-violet transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminar(s.id)}
                  className="text-xs text-slate-300 hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md mx-4 p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">
              {editando ? 'Editar servicio' : 'Nuevo servicio'}
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Corte de cabello"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-nexio-violet"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Duración (min)</label>
                  <input
                    type="number"
                    value={form.duracion_minutos}
                    onChange={e => setForm({ ...form, duracion_minutos: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-nexio-violet"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Precio (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.precio}
                    onChange={e => setForm({ ...form, precio: e.target.value })}
                    placeholder="0.00"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-nexio-violet"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={cerrarForm}
                className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={guardando}
                className="flex-1 bg-nexio-violet text-white text-sm font-medium py-2 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear servicio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}