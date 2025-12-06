'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/admin/companies', label: 'Empresas' },
    { href: '/admin/users', label: 'Usuarios' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Admin
              </Link>
              <div className="flex gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isActive
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Cerrar Sesión
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      {children}
    </div>
  )
}
