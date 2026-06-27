import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <p style={{ padding: '2rem' }}>Cargando...</p>

  if (!user) return <Login onLogin={setUser} />

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Nexio</h1>
      <p>Bienvenido, {user.email}</p>
      <button onClick={() => supabase.auth.signOut()}>Cerrar sesión</button>
    </div>
  )
}

export default App