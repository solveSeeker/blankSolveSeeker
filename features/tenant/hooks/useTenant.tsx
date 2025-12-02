'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/shared/lib/supabase/client'

interface Tenant {
  id: string
  slug: string
  name: string
  logo_url: string | null
  favicon_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  welcome_message: string | null
}

interface TenantContextType {
  tenant: Tenant | null
  loading: boolean
  error: string | null
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  loading: true,
  error: null,
})

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTenant() {
      try {
        // Get tenant slug from cookie
        const tenantSlug = document.cookie
          .split('; ')
          .find(row => row.startsWith('tenant-slug='))
          ?.split('=')[1] || 'demo'

        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('tenants')
          .select('*')
          .eq('slug', tenantSlug)
          .single()

        if (fetchError) throw fetchError

        setTenant(data)

        // Apply theming
        if (data) {
          document.documentElement.style.setProperty('--color-primary', data.primary_color)
          document.documentElement.style.setProperty('--color-secondary', data.secondary_color)
          document.documentElement.style.setProperty('--color-accent', data.accent_color)

          // Update favicon if available
          if (data.favicon_url) {
            const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
            if (link) {
              link.href = data.favicon_url
            }
          }

          // Update page title
          document.title = data.name
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading tenant')
        console.error('Error loading tenant:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTenant()
  }, [])

  return (
    <TenantContext.Provider value={{ tenant, loading, error }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}
