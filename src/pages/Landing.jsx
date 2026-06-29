import { useNavigate } from 'react-router-dom'

const COMPARATIVA = [
  { nombre: 'App de reservas', precio: '~30€/mes' },
  { nombre: 'Constructor web', precio: '~10€/mes' },
  { nombre: 'Software de gestión', precio: '~90€/mes' },
]

const FEATURES = [
  { icono: '📅', titulo: 'Reservas online', desc: 'Tus clientes reservan desde su móvil 24/7, sin llamadas.' },
  { icono: '📋', titulo: 'Gestión de agenda', desc: 'Ve todas tus citas, confirma, cancela o completa con un click.' },
  { icono: '✂️', titulo: 'Catálogo de servicios', desc: 'Define tus servicios con duración y precio. Actívalos cuando quieras.' },
  { icono: '🌐', titulo: 'Página propia', desc: 'URL personalizada para compartir con tus clientes.' },
]

const TIPOS = [
  'Peluquerías', 'Barberías', 'Clínicas estéticas', 'Fisioterapeutas',
  'Talleres', 'Restaurantes', 'Cafeterías', 'Tiendas',
  'Estudios de tatuaje', 'Psicólogos', 'Entrenadores personales', 'Centros de yoga'
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" style={{ fontFamily: 'sans-serif' }}>

      {/* Nav */}
      <nav className="flex justify-between items-center px-8 py-5 border-b border-slate-800">
        <span className="text-xl font-bold tracking-tight">nexio</span>
        <button
          onClick={() => navigate('/login')}
          className="border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 px-5 py-2 rounded-lg text-sm transition-colors"
        >
          Iniciar sesión
        </button>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-20 pb-16 max-w-2xl mx-auto">
        <div className="inline-block bg-slate-900 border border-slate-800 rounded-full px-4 py-1.5 text-xs text-slate-500 mb-8">
          Completamente gratis — sin tarjeta de crédito
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
          Gestiona tu negocio.<br />
          <span className="text-slate-500">Sin pagar una fortuna.</span>
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-lg mx-auto">
          Reservas online, gestión de citas y presencia web — todo en un solo sitio. Lo que antes costaba 150€/mes, ahora es gratis.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="bg-nexio-violet hover:bg-violet-700 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-colors"
        >
          Registra tu negocio gratis →
        </button>
      </section>

      {/* Comparativa */}
      <section className="px-6 pb-16 max-w-lg mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-center text-slate-500 text-xs uppercase tracking-widest mb-5">
            Lo que otros te cobran
          </h3>
          <div className="flex flex-col gap-2 mb-4">
            {COMPARATIVA.map(item => (
              <div key={item.nombre} className="flex justify-between items-center bg-slate-800/50 rounded-lg px-4 py-3">
                <span className="text-sm text-slate-400">{item.nombre}</span>
                <span className="text-sm font-semibold text-red-400">{item.precio}</span>
              </div>
            ))}
            <div className="flex justify-between items-center bg-slate-800/50 rounded-lg px-4 py-3 border-t border-slate-700 mt-1">
              <span className="text-sm text-slate-300 font-semibold">Total mensual</span>
              <span className="text-base font-bold text-red-400">~150€/mes</span>
            </div>
          </div>
          <div className="flex justify-between items-center bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-3.5">
            <span className="text-emerald-400 font-semibold text-sm">✓ Nexio — todo incluido</span>
            <span className="text-emerald-400 font-bold text-lg">0€/mes</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-16 max-w-3xl mx-auto">
        <h2 className="text-center text-2xl font-bold mb-10">Todo lo que necesita tu negocio</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map(f => (
            <div key={f.titulo} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-nexio-violet/50 transition-colors">
              <div className="text-2xl mb-3">{f.icono}</div>
              <p className="font-semibold text-sm mb-1">{f.titulo}</p>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Para quién */}
      <section className="px-6 pb-16 max-w-2xl mx-auto text-center">
        <h2 className="text-xl font-bold mb-6">Perfecto para tu tipo de negocio</h2>
        <div className="flex flex-wrap gap-2 justify-center">
          {TIPOS.map(tipo => (
            <span
              key={tipo}
              className="bg-slate-900 border border-slate-800 rounded-full px-4 py-1.5 text-xs text-slate-500"
            >
              {tipo}
            </span>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="text-center px-6 py-16 border-t border-slate-800">
        <h2 className="text-3xl font-bold mb-3">Empieza hoy. Es gratis.</h2>
        <p className="text-slate-500 mb-8">Sin tarjeta de crédito. Sin letra pequeña. Sin sorpresas.</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-nexio-violet hover:bg-violet-700 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-colors"
        >
          Crear cuenta gratis →
        </button>
      </section>

      {/* Footer */}
      <footer className="text-center px-6 py-6 border-t border-slate-800 text-slate-600 text-xs">
        nexio © 2026 — La plataforma gratuita para negocios
      </footer>

    </div>
  )
}