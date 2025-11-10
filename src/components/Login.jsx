import React, { useState } from 'react'

export default function Login({ backendURL }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e){
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const url = mode === 'login' ? '/auth/login' : '/auth/register'
      const res = await fetch(`${backendURL}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode==='login'?{email, password}:{name, email, password})
      })
      if(!res.ok) throw new Error((await res.json()).detail || 'Failed')
      const data = await res.json()
      localStorage.setItem('ts_token', data.access_token)
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/[0.04] border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-bold">{mode==='login'?'Welcome back':'Create account'}</h2>
        <p className="text-white/70 mt-1">Use test credentials to explore.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode==='register' && (
            <div>
              <label className="block text-sm text-white/70">Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg outline-none" required />
            </div>
          )}
          <div>
            <label className="block text-sm text-white/70">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg outline-none" required />
          </div>
          <div>
            <label className="block text-sm text-white/70">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg outline-none" required />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button disabled={loading} className="w-full py-2.5 rounded-lg bg-white text-black font-semibold hover:bg-white/90 disabled:opacity-50">{loading? 'Please wait...' : (mode==='login'? 'Login' : 'Create Account')}</button>
        </form>
        <button onClick={()=>setMode(mode==='login'?'register':'login')} className="mt-4 text-white/80 text-sm hover:underline">
          {mode==='login'? 'New here? Create an account' : 'Have an account? Login'}
        </button>
      </div>
    </div>
  )
}
