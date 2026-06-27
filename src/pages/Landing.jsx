import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white', fontFamily: 'sans-serif' }}>

      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', borderBottom: '1px solid #1a1a1a' }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>Nexio</span>
        <button onClick={() => navigate('/login')} style={{ background: 'none', border: '1px solid #333', color: '#aaa', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer' }}>
          Iniciar sesión
        </button>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '5rem 2rem 4rem', maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '20px', padding: '0.4rem 1rem', fontSize: '0.8rem', color: '#888', marginBottom: '2rem' }}>
          Completamente gratis — sin tarjeta de crédito
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.15, margin: '0 0 1.5rem' }}>
          Gestiona tu negocio.<br />
          <span style={{ color: '#888' }}>Sin pagar una fortuna.</span>
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#666', lineHeight: 1.7, margin: '0 0 2.5rem', maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto' }}>
          Reservas online, gestión de citas y presencia web — todo en un solo sitio. Lo que antes costaba 150€/mes, ahora es gratis.
        </p>
        <button onClick={() => navigate('/login')} style={{
          background: 'white', color: 'black', border: 'none', padding: '0.9rem 2.5rem',
          borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem',
          marginRight: '1rem'
        }}>
          Registra tu negocio gratis →
        </button>
      </section>

      {/* Comparativa de precio */}
      <section style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: '16px', padding: '2rem' }}>
          <h3 style={{ textAlign: 'center', color: '#666', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 1.5rem' }}>Lo que otros te cobran</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { nombre: 'Booksy (reservas)', precio: '~30€/mes', icono: '📅' },
              { nombre: 'Hostinger (web)', precio: '~10€/mes', icono: '🌐' },
              { nombre: 'Holded (gestión)', precio: '~90€/mes', icono: '📊' },
            ].map(item => (
              <div key={item.nombre} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#1a1a1a', borderRadius: '8px' }}>
                <span style={{ color: '#888' }}>{item.icono} {item.nombre}</span>
                <span style={{ color: '#f87171', fontWeight: 600 }}>{item.precio}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#1a1a1a', borderRadius: '8px', borderTop: '1px solid #2a2a2a' }}>
              <span style={{ color: '#888', fontWeight: 600 }}>Total mensual</span>
              <span style={{ color: '#f87171', fontWeight: 700, fontSize: '1.1rem' }}>~150€/mes</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#0d2818', border: '1px solid #166534', borderRadius: '10px' }}>
            <span style={{ color: '#86efac', fontWeight: 600 }}>✓ Nexio — todo incluido</span>
            <span style={{ color: '#86efac', fontWeight: 700, fontSize: '1.25rem' }}>0€/mes</span>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 700, margin: '0 0 3rem' }}>Todo lo que necesita tu negocio</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { icono: '📅', titulo: 'Reservas online', desc: 'Tus clientes reservan desde su móvil 24/7, sin llamadas.' },
            { icono: '📋', titulo: 'Gestión de agenda', desc: 'Ve todas tus citas, confirma, cancela o completa con un click.' },
            { icono: '✂️', titulo: 'Catálogo de servicios', desc: 'Define tus servicios con duración y precio. Actívalos o desactívalos.' },
            { icono: '🌐', titulo: 'Página propia', desc: 'URL personalizada para compartir con tus clientes.' },
          ].map(f => (
            <div key={f.titulo} style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{f.icono}</div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{f.titulo}</div>
              <div style={{ color: '#666', fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Para quién */}
      <section style={{ padding: '0 2rem 4rem', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 1rem' }}>Perfecto para tu tipo de negocio</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
          {['Peluquerías', 'Barberías', 'Clínicas estéticas', 'Fisioterapeutas', 'Talleres', 'Restaurantes', 'Cafeterías', 'Tiendas', 'Estudios de tatuaje', 'Psicólogos', 'Entrenadores personales', 'Centros de yoga'].map(tipo => (
            <span key={tipo} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '20px', padding: '0.4rem 1rem', fontSize: '0.875rem', color: '#888' }}>
              {tipo}
            </span>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section style={{ textAlign: 'center', padding: '4rem 2rem', borderTop: '1px solid #1a1a1a' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 1rem' }}>Empieza hoy. Es gratis.</h2>
        <p style={{ color: '#666', margin: '0 0 2rem' }}>Sin tarjeta de crédito. Sin letra pequeña. Sin sorpresas.</p>
        <button onClick={() => navigate('/login')} style={{
          background: 'white', color: 'black', border: 'none', padding: '0.9rem 2.5rem',
          borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem'
        }}>
          Crear cuenta gratis →
        </button>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid #1a1a1a', color: '#444', fontSize: '0.8rem' }}>
        Nexio © 2026 — La plataforma gratuita para negocios
      </footer>

    </div>
  )
}