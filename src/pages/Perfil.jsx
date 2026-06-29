import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const CATEGORIAS = [
  'Peluquería', 'Barbería', 'Clínica estética', 'Fisioterapia',
  'Taller mecánico', 'Restaurante', 'Cafetería', 'Tienda', 'Otro'
]

const inputClass = "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-nexio-violet transition-colors"
const labelClass = "block text-xs font-medium text-slate-600 mb-1"

export default function Perfil({ negocio, onUpdate }) {
  const [form, setForm] = useState({
    nombre: '', categoria: '', telefono: '', direccion: '', descripcion: ''
  })
  const [guardando, setGuardando] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (negocio) {
      setForm({
        nombre: negocio.nombre || '',
        categoria: negocio.categoria || '',
        telefono: negocio.telefono || '',
        direccion: negocio.direccion || '',
        descripcion: negocio.descripcion || '',
      })
    }
  }, [negocio])

  const guardar = async () => {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    setGuardando(true)
    setError(null)
    setExito(false)

    const { error: err } = await supabase
      .from('negocios')
      .update({
        nombre: form.nombre.trim(),
        categoria: form.categoria,
        telefono: form.telefono.trim(),
        direccion: form.direccion.trim(),
        descripcion: form.descripcion.trim(),
      })
      .eq('id', negocio.id)

    if (err) {
      setError('Error al guardar. Inténtalo de nuevo.')
    } else {
      setExito(true)
      onUpdate()
      setTimeout(() => setExito(false), 3000)
    }
    setGuardando(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 bg-white border-b border-slate-200 flex-shrink-0">
        <h1 className="text-base font-semibold text-slate-900">Perfil del negocio</h1>
        <p className="text-xs text-slate-400 mt-0.5">Edita los datos que verán tus clientes</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-lg">

          {/* Slug info */}
          {negocio?.slug && (
            <div className="bg-nexio-violet-soft border border-violet-100 rounded-xl px-4 py-3 mb-6">
              <p className="text-xs font-medium text-nexio-violet mb-1">Tu enlace de reservas</p>
              <p className="text-sm text-nexio-sidebar font-mono break-all">
                {window.location.origin}/reservar/{negocio.slug}
              </p>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex flex-col gap-4">

              <div>
                <label className={labelClass}>Nombre del negocio *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                  placeholder="Ej: Peluquería Marta"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Categoría</label>
                <select
                  value={form.categoria}
                  onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Selecciona una categoría</option>
                  {CATEGORIAS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Teléfono</label>
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
                  placeholder="Ej: 612 345 678"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Dirección</label>
                <input
                  type="text"
                  value={form.direccion}
                  onChange={e => setForm(p => ({ ...p, direccion: e.target.value }))}
                  placeholder="Ej: Calle Mayor 12, Madrid"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Descripción breve</label>
                <textarea
                  value={form.descripcion}
                  onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                  placeholder="Ej: Barbería clásica con 10 años de experiencia"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-4">
                {error}
              </p>
            )}

            {exito && (
              <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 mt-4">
                ✓ Cambios guardados correctamente
              </p>
            )}

            <button
              onClick={guardar}
              disabled={guardando}
              className="w-full mt-5 bg-nexio-violet text-white text-sm font-medium py-2.5 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}