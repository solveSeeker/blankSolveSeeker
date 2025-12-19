'use client'

import Sidebar from '@/shared/components/Sidebar'
import { usePathname } from 'next/navigation'
import { UserCog, Shield, Building2, ScrollText, Settings } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Determinar el título y descripción según la ruta
  const getPageInfo = () => {
    if (pathname.includes('/users')) {
      return {
        category: 'Gestión',
        title: 'Usuarios',
        description: 'Gestiona los usuarios y sus roles en el sistema',
        icon: <UserCog className="w-5 h-5" />
      }
    }
    if (pathname.includes('/roles')) {
      return {
        category: 'Gestión',
        title: 'Roles',
        description: 'Gestiona los roles y permisos del sistema',
        icon: <Shield className="w-5 h-5" />
      }
    }
    if (pathname.includes('/companies')) {
      return {
        category: 'Gestión',
        title: 'Empresas',
        description: 'Gestiona las empresas del sistema multi-tenant',
        icon: <Building2 className="w-5 h-5" />
      }
    }
    if (pathname.includes('/audit')) {
      return {
        category: 'Gestión',
        title: 'Auditoría',
        description: 'Registro de cambios en el sistema',
        icon: <ScrollText className="w-5 h-5" />
      }
    }
    if (pathname.includes('/settings')) {
      return {
        category: 'Configuración',
        title: 'Configuración',
        description: 'Gestiona las preferencias de tu cuenta',
        icon: <Settings className="w-5 h-5" />
      }
    }
    if (pathname.includes('/profile')) {
      return {
        category: 'Mi Cuenta',
        title: 'Mi Perfil',
        description: 'Gestiona tu información personal',
        icon: <UserCog className="w-5 h-5" />
      }
    }
    return {
      category: 'Gestión',
      title: '',
      description: '',
      icon: null
    }
  }

  const pageInfo = getPageInfo()

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <div className="flex items-center h-16 px-8 border-b border-gray-200 bg-white">
          {pageInfo.title && (
            <div className="flex items-center gap-3">
              {pageInfo.icon && (
                <div className="text-gray-700">
                  {pageInfo.icon}
                </div>
              )}
              <h1 className="text-lg font-semibold text-gray-900">{pageInfo.title}</h1>
              {pageInfo.description && (
                <>
                  <span className="text-gray-400">-</span>
                  <p className="text-sm text-gray-600">{pageInfo.description}</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {children}
      </main>
    </div>
  )
}
