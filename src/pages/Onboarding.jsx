import { useState } from 'react'
import { supabase } from '../lib/supabase'

const CATEGORIAS = [
  'Peluquería', 'Barbería', 'Clínica estética', 'Fisioterapia',
  'Taller mecánico', 'Restaurante', 'Cafetería', 'Tienda', 'Otro'
]

const inputClass = "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-nexio-violet transition-colors"
const labelClass = "block text-xs font-medium text-slate-600 mb-1"

export default function Onboarding({ user, onComplete }) {
  const [form, setForm] = useState({
    nombre: '', categoria: '', telefono: '', direccion: '', descripcion: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    if (!form.nombre.trim()) { setError('El nombre del negocio es obligatorio'); return }
    setLoading(true)
    setError(null)

    const { error: err } = await supabase
      .from('negocios')
      .update({
        nombre: form.nombre.trim(),
        categoria: form.categoria,
        telefono: form.telefono.trim(),
        direccion: form.direccion.trim(),
        descripcion: form.descripcion.trim()
      })
      .eq('id', user.id)

    if (err) setError('Error al guardar. Inténtalo de nuevo.')
    else onComplete()
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-nexio-bg flex flex-col items-center justify-center px-4 py-10">

      <div className="text-center mb-8">
        <span className="text-3xl font-bold text-nexio-sidebar tracking-tight">nexio</span>
        <p className="text-sm text-slate-400 mt-1">Cuéntanos sobre tu negocio</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md p-6">

        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-900">Configura tu negocio</h2>
          <p className="text-xs text-slate-400 mt-0.5">Solo tardas 1 minuto. Puedes cambiarlo después.</p>
        </div>

        <div className="flex flex-col gap-4">

          <div>
            <label className={labelClass}>Nombre del negocio *</label>
            <input
              type="text"
              placeholder="Ej: Peluquería Marta"
              value={form.nombre}
              onChange={e => handleChange('nombre', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Categoría</label>
            <select
              value={form.categoria}
              onChange={e => handleChange('categoria', e.target.value)}
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
              placeholder="Ej: 612 345 678"
              value={form.telefono}
              onChange={e => handleChange('telefono', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Dirección</label>
            <input
              type="text"
              placeholder="Ej: Calle Mayor 12, Madrid"
              value={form.direccion}
              onChange={e => handleChange('direccion', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Descripción breve</label>
            <textarea
              placeholder="Ej: Peluquería familiar con 10 años de experiencia"
              value={form.descripcion}
              onChange={e => handleChange('descripcion', e.target.value)}
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

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-5 bg-nexio-violet text-white text-sm font-medium py-2.5 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Empezar a usar Nexio →'}
        </button>

      </div>

      <p className="text-xs text-slate-400 mt-6">
        Gestionado con <span className="text-nexio-violet font-medium">nexio</span>
      </p>

    </div>
  )
}