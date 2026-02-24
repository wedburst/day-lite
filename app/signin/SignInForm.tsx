'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/profile'

  const [email, setEmail] = useState('demo@auth.com')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (!result || result.error) {
      setError('Credenciales inválidas.')
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-black dark:focus:border-white/30"
          autoComplete="email"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-black dark:focus:border-white/30"
          autoComplete="current-password"
          required
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-black/10 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:border-white/15 dark:bg-white/5 dark:text-zinc-50">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="cursor-pointer h-11 rounded-xl bg-black px-4 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
      >
        {loading ? 'Ingresando…' : 'Ingresar'}
      </button>

      <p className="text-xs text-zinc-600 dark:text-zinc-400">
        Demo: <span className="font-medium">demo@auth.com</span> / <span className="font-medium">123456</span>
      </p>
    </form>
  )
}
