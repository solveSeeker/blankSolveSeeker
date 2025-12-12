'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-normal mb-2">
          Iniciar sesión
        </h1>
        <p className="text-base text-muted-foreground">
          Ingresa tu correo y contraseña para acceder
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-6">
        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Correo electrónico
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu@ejemplo.com"
          />
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <Label htmlFor="password">
            Contraseña
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Button>

        {/* Register Link */}
        <div className="text-center pt-4">
          <span className="text-sm text-muted-foreground">¿No tienes cuenta? </span>
          <a href="/auth/register" className="text-sm font-medium hover:underline">
            Regístrate
          </a>
        </div>
      </form>
    </div>
  )
}
