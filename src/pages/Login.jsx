import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modo, setModo] = useState('login') // 'login' o 'registro'

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    let result
    if (modo === 'registro') {
      result = await supabase.auth.signUp({ email, password })
    } else {
      result = await supabase.auth.signInWithPassword({ email, password })
    }

    if (result.error) {
      setError(result.error.message)
    } else {
      if (modo === 'registro') {
        setError('Revisa tu email para confirmar el registro.')
      } else {
        onLogin(result.data.user)
      }
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Nexio</h1>
      <h2>{modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={handleSubmit} disabled={loading}
        style={{ width: '100%', padding: '0.75rem', background: '#18181b', color: 'white', border: 'none', cursor: 'pointer' }}>
        {loading ? 'Cargando...' : modo === 'login' ? 'Entrar' : 'Registrarse'}
      </button>

      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        {modo === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
        <button onClick={() => setModo(modo === 'login' ? 'registro' : 'login')}
          style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', marginLeft: '0.5rem' }}>
          {modo === 'login' ? 'Regístrate' : 'Inicia sesión'}
        </button>
      </p>
    </div>
  )
}