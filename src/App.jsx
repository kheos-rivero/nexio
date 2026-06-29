import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Servicios from './pages/Servicios'
import Citas from './pages/Citas'
import Perfil from './pages/Perfil'
import ReservasOnline from './pages/ReservasOnline'
import ReservaPublica from './pages/ReservaPublica'
import Horarios from './pages/Horarios'
import Layout from './components/Layout'

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

  if (loading) return (
    <div className="min-h-screen bg-nexio-sidebar flex items-center justify-center">
      <p className="text-white/50 text-sm">Cargando...</p>
    </div>
  )

  return (
    <Routes>
      <Route path="/reservar/:slug" element={<ReservaPublica />} />
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={setUser} />} />

      {!user && <Route path="/" element={<Landing />} />}
      {!user && <Route path="*" element={<Navigate to="/login" />} />}

      {user && !negocio?.nombre && (
        <Route path="*" element={<Onboarding user={user} onComplete={() => cargarNegocio(user.id)} />} />
      )}

      {user && negocio?.nombre && (
        <>
          <Route path="/" element={
            <Layout negocio={negocio}>
              <Dashboard negocio={negocio} />
            </Layout>
          } />
          <Route path="/servicios" element={
            <Layout negocio={negocio}>
              <Servicios negocio={negocio} />
            </Layout>
          } />
          <Route path="/citas" element={
            <Layout negocio={negocio}>
              <Citas negocio={negocio} />
            </Layout>
          } />
          <Route path="/horarios" element={
            <Layout negocio={negocio}>
              <Horarios negocio={negocio} />
            </Layout>
          } />
          <Route path="/perfil" element={
            <Layout negocio={negocio}>
              <Perfil negocio={negocio} onUpdate={() => cargarNegocio(user.id)} />
            </Layout>
          } />
          <Route path="/reservas-online" element={
            <Layout negocio={negocio}>
              <ReservasOnline negocio={negocio} />
            </Layout>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}
    </Routes>
  )
}

export default App