'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface AuthFormProps {
  type: 'login' | 'signup'
}

export function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (type === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm`,
          },
        })
        if (signUpError) throw signUpError
        setMessage('Check your email for the confirmation link!')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-black text-white font-jakarta tracking-tight">
          {type === 'login' ? 'Welcome Back' : 'Join Quantr'}
        </h1>
        <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest">
          {type === 'login' ? 'Institutional Grade Research' : 'Precision Screening & Analytics'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-bold py-2 px-3 rounded-lg flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        {message && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-bold py-2 px-3 rounded-lg flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-emerald-500" />
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-zinc-950 font-black text-xs uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin font-black" />
          ) : (
            <>
              {type === 'login' ? 'Sign In' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-4 text-center">
        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
          {type === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
          <Link
            href={type === 'login' ? '/signup' : '/login'}
            className="text-emerald-500 hover:text-emerald-400 transition-colors underline underline-offset-4"
          >
            {type === 'login' ? 'Sign Up Free' : 'Sign In'}
          </Link>
        </p>
      </div>
    </div>
  )
}
