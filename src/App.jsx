import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [status, setStatus] = useState('Comprobando conexión...')

  useEffect(() => {
    supabase.auth.getSession().then(() => {
      setStatus('✅ Supabase conectado correctamente')
    }).catch(() => {
      setStatus('❌ Error de conexión')
    })
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Nexio</h1>
      <p>{status}</p>
    </div>
  )
}

export default App