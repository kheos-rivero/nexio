import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Servicios from './pages/Servicios'
import Citas from './pages/Citas'
import ReservaPublica from './pages/ReservaPublica'

function App() {
  const [user, setUser] = useState(null)
  const [negocio, setNegocio] = useState(null)
  const [loading, setLoading] = useState(true)

  const cargarNegocio = async (userId) => {
    const { data } = await supabase
      .from('negocios')
      .select('*')
      .eq('id', userId)
      .single()
    setNegocio(data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) await cargarNegocio(u.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) await cargarNegocio(u.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <p style={{ padding: '2rem', color: 'white', background: '#0f0f0f', minHeight: '100vh', margin: 0 }}>Cargando...</p>

  return (
    <Routes>
      {/* Rutas públicas — sin login */}
      <Route path="/reservar/:slug" element={<ReservaPublica />} />
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={setUser} />} />

      {/* Landing — solo si no hay sesión */}
      {!user && <Route path="/" element={<Landing />} />}

      {/* Rutas privadas */}
      {user && !negocio?.nombre && <Route path="*" element={<Onboarding user={user} onComplete={() => cargarNegocio(user.id)} />} />}
      {user && negocio?.nombre && (
        <>
          <Route path="/" element={<Dashboard negocio={negocio} />} />
          <Route path="/servicios" element={<Servicios negocio={negocio} />} />
          <Route path="/citas" element={<Citas negocio={negocio} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}
    </Routes>
  )
}

export default App