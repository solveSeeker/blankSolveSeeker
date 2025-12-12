'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/client'
import { useState } from 'react'
import { UserCog, Shield, LogOut } from 'lucide-react'

interface MenuItem {
  icon: React.ReactNode
  label: string
  href: string
  isActive?: boolean
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      setIsLoggingOut(false)
    }
  }

  const menuItems: MenuItem[] = [
    {
      icon: <UserCog className="w-5 h-5" />,
      label: 'Usuarios',
      href: '/dashboard/users',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: 'Roles',
      href: '/dashboard/roles',
    },
  ]

  return (
    <aside className="w-64 bg-white min-h-screen flex flex-col border-r border-gray-200">
      {/* Dashboard Header */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <h1 className="text-gray-900 text-lg font-semibold">Dashboard</h1>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer / User Info */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">
            {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
          </span>
        </button>
      </div>
    </aside>
  )
}
