import { NavLink } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/servicios', label: 'Servicios' },
  { to: '/citas', label: 'Citas' },
  { to: '/horarios', label: 'Horarios' },
  { to: '/reservas-online', label: 'Reservas online' },
  { to: '/perfil', label: 'Perfil' },
]

export default function Layout({ negocio, children }) {
  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="flex h-screen bg-nexio-bg">
      <aside className="w-52 bg-nexio-sidebar flex flex-col flex-shrink-0">
        <div className="px-4 pt-5 pb-4 border-b border-white/10">
          <span className="text-white text-lg font-bold tracking-tight">nexio</span>
          <span className="block text-white/40 text-[11px] mt-0.5 truncate">{negocio?.nombre}</span>
        </div>

        <nav className="flex-1 px-2.5 py-2 flex flex-col gap-0.5">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm border-l-2 transition-colors ${
                  isActive
                    ? 'bg-nexio-violet/20 border-nexio-violet-muted text-white font-medium'
                    : 'border-transparent text-white/45 hover:text-white/70 hover:bg-white/5'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-2.5 py-3 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="w-full px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/60 hover:bg-white/5 transition-colors text-left"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {children}
      </main>
    </div>
  )
}