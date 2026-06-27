import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Dashboard({ negocio }) {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'sans-serif', background: '#0f0f0f', color: 'white' }}>
      
      {/* Header */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 2rem', borderBottom: '1px solid #222'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Nexio</h1>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{ background: 'none', border: '1px solid #444', color: '#aaa', padding: '0.4rem 1rem', cursor: 'pointer', borderRadius: '6px' }}
        >
          Cerrar sesión
        </button>
      </header>

      {/* Bienvenida */}
      <div style={{ padding: '2rem', borderBottom: '1px solid #222' }}>
        <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.75rem' }}>
          Hola, {negocio.nombre} 👋
        </h2>
        <p style={{ margin: 0, color: '#888' }}>
          {negocio.categoria}{negocio.direccion ? ` · ${negocio.direccion}` : ''}
        </p>
      </div>

      {/* Tarjetas de navegación */}
      <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        
        <TarjetaNav
          titulo="Servicios"
          descripcion="Gestiona lo que ofreces"
          icono="✂️"
          onClick={() => navigate('/servicios')}
        />
        <TarjetaNav
          titulo="Citas"
          descripcion="Ve y gestiona tu agenda"
          icono="📅"
          onClick={() => alert('Próximamente — Tarea G')}
        />
        <TarjetaNav
          titulo="Reservas online"
          descripcion="Tu página pública de reservas"
          icono="🌐"
          onClick={() => alert('Próximamente — Tarea J')}
        />
        <TarjetaNav
          titulo="Perfil"
          descripcion="Edita los datos de tu negocio"
          icono="⚙️"
          onClick={() => alert('Próximamente')}
        />

      </div>

      {/* Resumen rápido */}
      <div style={{ padding: '0 2rem 2rem' }}>
        <h3 style={{ color: '#666', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
          Resumen
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <Stat label="Citas hoy" valor="—" />
          <Stat label="Esta semana" valor="—" />
          <Stat label="Servicios activos" valor="—" />
        </div>
      </div>

    </div>
  )
}

function TarjetaNav({ titulo, descripcion, icono, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px',
        padding: '1.5rem', cursor: 'pointer', textAlign: 'left', color: 'white',
        transition: 'border-color 0.2s'
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#444'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
    >
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{icono}</div>
      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{titulo}</div>
      <div style={{ color: '#888', fontSize: '0.875rem' }}>{descripcion}</div>
    </button>
  )
}

function Stat({ label, valor }) {
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '1.25rem' }}>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>{valor}</div>
      <div style={{ color: '#888', fontSize: '0.875rem' }}>{label}</div>
    </div>
  )
}