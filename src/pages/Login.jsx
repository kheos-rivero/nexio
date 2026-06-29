import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login({ onLogin }) {
  const [modo, setModo] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmado, setConfirmado] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (!email || !password) { setError('Rellena todos los campos.'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    setLoading(true)

    if (modo === 'login') {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) { setError('Email o contraseña incorrectos.'); setLoading(false); return }
      onLogin(data.user)
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password })
      if (err) { setError(err.message); setLoading(false); return }
      setConfirmado(true)
    }
    setLoading(false)
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit() }

  if (confirmado) return (
    <div className="min-h-screen bg-nexio-bg flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-sm p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-emerald-600 text-xl">✓</span>
        </div>
        <h2 className="text-base font-semibold text-slate-900 mb-2">Revisa tu email</h2>
        <p className="text-sm text-slate-400">
          Te hemos enviado un enlace de confirmación a <span className="text-slate-600 font-medium">{email}</span>. Confirma tu cuenta para entrar.
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-nexio-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <span className="text-3xl font-bold text-nexio-sidebar tracking-tight">nexio</span>
          <p className="text-sm text-slate-400 mt-1">
            {modo === 'login' ? 'Accede a tu panel' : 'Crea tu cuenta gratis'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">

          <div className="flex bg-slate-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => { setModo('login'); setError('') }}
              className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
                modo === 'login' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => { setModo('registro'); setError('') }}
              className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
                modo === 'registro' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Registrarse
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="tu@email.com"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-nexio-violet transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Mínimo 6 caracteres"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-nexio-violet transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-nexio-violet text-white text-sm font-medium py-2.5 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 mt-1"
            >
              {loading ? 'Cargando...' : modo === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Al registrarte aceptas nuestros{' '}
          <span className="text-nexio-violet cursor-pointer hover:underline">términos de uso</span>
        </p>

      </div>
    </div>
  )
}