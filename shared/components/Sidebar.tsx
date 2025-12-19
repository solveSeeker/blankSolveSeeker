'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/client'
import { useState } from 'react'
import { UserCog, Shield, Building2, LogOut, ScrollText, User, Settings } from 'lucide-react'
import { useCurrentUserProfile } from '@/features/users/hooks/useCurrentUserProfile'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface MenuItem {
  icon: React.ReactNode
  label: string
  href: string
  isActive?: boolean
  sysAdminOnly?: boolean
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, isSysAdmin } = useCurrentUserProfile()
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
    {
      icon: <Building2 className="w-5 h-5" />,
      label: 'Empresas',
      href: '/dashboard/companies',
    },
    {
      icon: <ScrollText className="w-5 h-5" />,
      label: 'Auditoría',
      href: '/dashboard/audit',
      sysAdminOnly: true,
    },
  ]

  // Filter menu items based on user permissions
  const visibleMenuItems = menuItems.filter(item => {
    if (item.sysAdminOnly && !isSysAdmin) {
      return false
    }
    return true
  })

  return (
    <aside className="w-64 bg-white min-h-screen flex flex-col border-r border-gray-200">
      {/* Dashboard Header */}
      <div className="flex items-center gap-3 h-16 px-6 border-b border-gray-200">
        <img
          src="/isotipo.webp"
          alt="Solve Seeker"
          className="h-8 w-auto"
        />
        <h1 className="text-gray-900 text-lg font-semibold">Dashboard</h1>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {visibleMenuItems.map((item) => {
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
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-gray-100">
                  <User className="h-5 w-5 text-gray-600" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.fullName || 'Sin nombre'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {profile?.email}
                </p>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="end" side="right" sideOffset={8}>
            <div className="space-y-1">
              {/* Header del popup con info del usuario */}
              <div className="px-3 py-2 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.fullName || 'Sin nombre'}
                </p>
                <p className="text-xs text-gray-500">
                  {profile?.email}
                </p>
              </div>

              {/* Opciones del menú */}
              <div className="py-1">
                <Link
                  href="/dashboard/profile"
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Perfil</span>
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Configuración</span>
                </Link>
              </div>

              {/* Cerrar sesión */}
              <div className="pt-1 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </aside>
  )
}
