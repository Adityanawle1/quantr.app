'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/global/logo'

interface AuthFormProps {
  type: 'login' | 'signup'
}

function PasswordStrength({ password }: { password: string }) {
  const getStrength = (p: string) => {
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score
  }
  const strength = getStrength(password)
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', '#ef4444', '#f59e0b', '#2563eb', '#22c55e']

  if (!password) return null

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i <= strength ? colors[strength] : 'rgba(255,255,255,0.06)',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>
      {strength > 0 && (
        <div style={{ fontSize: 11, marginTop: 4, color: colors[strength] }}>
          {labels[strength]}
        </div>
      )}
    </div>
  )
}

export function AuthForm({ type }: AuthFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const supabase = createClient()
  const router = useRouter()

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (type === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
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
            data: { full_name: name }
          },
        })
        if (signUpError) throw signUpError
        setMessage('Check your email for the confirmation link!')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
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
    <div className="min-h-screen bg-background-surface flex font-sans transition-colors duration-300">
      {/* LEFT PANEL */}
      <div className="hidden md:flex w-[40%] bg-background-primary border-r border-border-subtle flex-col justify-center px-10 py-12 relative auth-left-panel shadow-[2px_0_8px_rgba(0,0,0,0.04)]">
        {/* Logo */}
        <div className="mb-3">
          <Logo size="lg" />
        </div>

        {/* Tagline */}
        <div className="italic text-xl text-t2 mb-8 font-display">
          Invest with Precision.
        </div>

        {/* Feature bullets */}
        <div className="flex flex-col gap-3">
          {[
            'Screener across 5,000+ NSE & BSE stocks',
            'Real-time portfolio P&L and XIRR',
            'AI-powered portfolio analysis',
          ].map((point, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-1 h-1 rounded-full bg-primary shrink-0" />
              <span className="text-[13px] text-t3">{point}</span>
            </div>
          ))}
        </div>

        {/* Exchange badge */}
        <div className="absolute bottom-8 left-10 text-[10px] text-t4 tracking-[0.15em] uppercase">
          NSE · BSE · MCX
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="max-w-[380px] w-full">
          {/* Mobile logo */}
          <div className="auth-mobile-logo md:hidden mb-6">
            <Logo size="md" />
          </div>

          {/* Heading */}
          <h1 className="font-display text-3xl text-t1 mb-2 font-normal">
            {type === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-sm text-t3 mb-10">
            {type === 'login' ? 'Sign in to access your portfolio' : 'Start for free. No credit card required.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name — signup only */}
            {type === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[11px] text-t2 uppercase tracking-wider font-medium">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="w-full bg-background-primary border border-border-default rounded-lg px-3.5 py-3 text-t1 text-sm outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 placeholder:text-t4"
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-t2 uppercase tracking-wider font-medium">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full bg-background-primary border border-border-default rounded-lg px-3.5 py-3 text-t1 text-sm outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 placeholder:text-t4"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] text-t2 uppercase tracking-wider font-medium">Password</label>
                {type === 'login' && (
                  <Link href="#" className="text-xs text-t3 hover:text-primary hover:underline transition-colors">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-background-primary border border-border-default rounded-lg pl-3.5 pr-11 py-3 text-t1 text-sm outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 placeholder:text-t4"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-t3 hover:text-t2 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {type === 'signup' && <PasswordStrength password={password} />}
            </div>

            {/* Confirm Password — signup only */}
            {type === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[11px] text-t2 uppercase tracking-wider font-medium">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-background-primary border border-border-default rounded-lg pl-3.5 pr-11 py-3 text-t1 text-sm outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 placeholder:text-t4"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {passwordsMatch && <Check size={14} className="text-gain" />}
                    {passwordsMismatch && <X size={14} className="text-loss" />}
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="text-t3 hover:text-t2 transition-colors"
                    >
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-loss/10 border border-loss/20 rounded-md px-3.5 py-2.5 text-xs text-loss leading-relaxed">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-primary/10 border border-primary/20 rounded-md px-3.5 py-2.5 text-xs text-primary leading-relaxed">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-11 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                loading 
                  ? 'bg-primary/50 text-white/50 cursor-not-allowed' 
                  : 'bg-primary text-white hover:bg-accent-blue-light shadow-sm active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {type === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                type === 'login' ? 'Sign in' : 'Create account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-xs text-t4">or</span>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>

          {/* Toggle signup/login */}
          <p className="text-[13px] text-t3 text-center">
            {type === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Link
              href={type === 'login' ? '/signup' : '/login'}
              className="text-primary font-semibold hover:underline transition-all"
            >
              {type === 'login' ? 'Create one' : 'Sign in'}
            </Link>
          </p>

          {/* Footer */}
          <p className="text-[10px] text-t4 text-center mt-10 tracking-wider uppercase">
            © 2026 QUANTR TECHNOLOGIES · INSTITUTIONAL GRADE SECURITY
          </p>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
