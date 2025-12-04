'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Animación de la barra de progreso
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + (100 / 30) // 30 pasos en 3 segundos (100ms cada uno)
      })
    }, 100)

    // Redirección después de 3 segundos
    const redirectTimer = setTimeout(() => {
      router.push('/login')
    }, 3000)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(redirectTimer)
    }
  }, [router])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="text-center px-6 w-full max-w-md">
        {/* Título */}
        <h1 className="text-3xl font-normal text-gray-900 mb-16">
          Sistema de Gestión
        </h1>

        {/* Barra de Progreso */}
        <div className="w-full">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-navy transition-all duration-100 ease-linear"
              style={{
                width: `${progress}%`,
                backgroundColor: '#001f3f' // Navy color
              }}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
