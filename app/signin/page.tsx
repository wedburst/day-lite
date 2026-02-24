import { authOptions } from '@/auth'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import SignInForm from './SignInForm'

export default async function SignInPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/profile')

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto w-full max-w-md px-4 py-14 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Accede para ver tu perfil.
        </p>
        <SignInForm />
      </div>
    </div>
  )
}
