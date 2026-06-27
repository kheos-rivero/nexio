import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'

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

  if (!user) return <Login onLogin={setUser} />

  if (!negocio?.nombre) return (
    <Onboarding user={user} onComplete={() => cargarNegocio(user.id)} />
  )

  return <Dashboard negocio={negocio} />
}

export default App