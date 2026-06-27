import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'

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

  if (loading) return <p style={{ padding: '2rem' }}>Cargando...</p>

  if (!user) return <Login onLogin={setUser} />

  if (!negocio?.nombre) return (
    <Onboarding
      user={user}
      onComplete={() => cargarNegocio(user.id)}
    />
  )

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Nexio</h1>
      <p>Bienvenido, <strong>{negocio.nombre}</strong></p>
      <p style={{ color: '#666' }}>{negocio.categoria} · {negocio.direccion}</p>
      <button onClick={() => supabase.auth.signOut()}>Cerrar sesión</button>
    </div>
  )
}

export default App