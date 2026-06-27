import { useState } from 'react'
import { supabase } from '../lib/supabase'

const CATEGORIAS = [
  'Peluquería', 'Barbería', 'Clínica estética', 'Fisioterapia',
  'Taller mecánico', 'Restaurante', 'Cafetería', 'Tienda', 'Otro'
]

export default function Onboarding({ user, onComplete }) {
  const [form, setForm] = useState({
    nombre: '',
    categoria: '',
    telefono: '',
    direccion: '',
    descripcion: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!form.nombre.trim()) {
      setError('El nombre del negocio es obligatorio')
      return
    }
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from('negocios')
      .update({
        nombre: form.nombre.trim(),
        categoria: form.categoria,
        telefono: form.telefono.trim(),
        direccion: form.direccion.trim(),
        descripcion: form.descripcion.trim()
      })
      .eq('id', user.id)

    if (error) {
      setError('Error al guardar. Inténtalo de nuevo.')
    } else {
      onComplete()
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 480, margin: '3rem auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Nexio</h1>
      <h2>Cuéntanos sobre tu negocio</h2>
      <p style={{ color: '#666' }}>Solo tardas 1 minuto. Puedes cambiarlo después.</p>

      <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
        Nombre del negocio *
      </label>
      <input
        type="text"
        placeholder="Ej: Peluquería Marta"
        value={form.nombre}
        onChange={e => handleChange('nombre', e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem', boxSizing: 'border-box' }}
      />

      <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
        Categoría
      </label>
      <select
        value={form.categoria}
        onChange={e => handleChange('categoria', e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem', boxSizing: 'border-box' }}
      >
        <option value="">Selecciona una categoría</option>
        {CATEGORIAS.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
        Teléfono
      </label>
      <input
        type="tel"
        placeholder="Ej: 612 345 678"
        value={form.telefono}
        onChange={e => handleChange('telefono', e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem', boxSizing: 'border-box' }}
      />

      <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
        Dirección
      </label>
      <input
        type="text"
        placeholder="Ej: Calle Mayor 12, Madrid"
        value={form.direccion}
        onChange={e => handleChange('direccion', e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem', boxSizing: 'border-box' }}
      />

      <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
        Descripción breve
      </label>
      <textarea
        placeholder="Ej: Peluquería familiar con 10 años de experiencia"
        value={form.descripcion}
        onChange={e => handleChange('descripcion', e.target.value)}
        rows={3}
        style={{ display: 'block', width: '100%', marginBottom: '1.5rem', padding: '0.5rem', boxSizing: 'border-box', resize: 'vertical' }}
      />

      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ width: '100%', padding: '0.75rem', background: '#18181b', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
      >
        {loading ? 'Guardando...' : 'Empezar a usar Nexio →'}
      </button>
    </div>
  )
}