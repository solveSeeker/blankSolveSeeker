'use client'

import { useEffect, useState } from 'react'
import { useCompanies } from '../hooks'
import type { Company } from '../types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty } from '@/components/ui/empty'
import { CompanyDialog } from './company-dialog'
import { DeleteCompanyDialog } from './delete-company-dialog'
import { Plus, Search, Building2, Eye, EyeOff, Check, X } from 'lucide-react'

export function CompaniesTable() {
  const { companies, isLoading, error, refetch } = useCompanies()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCompanies, setFilteredCompanies] = useState(companies || [])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (companies) {
      const filtered = companies.filter(company =>
        company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.slug?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCompanies(filtered)
    }
  }, [companies, searchTerm])

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company)
    setIsEditDialogOpen(true)
  }

  const handleDeleteCompany = (company: Company) => {
    setSelectedCompany(company)
    setIsDeleteDialogOpen(true)
  }

  const handleCompanySaved = () => {
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setSelectedCompany(null)
    refetch()
  }

  const handleCompanyDeleted = () => {
    setIsDeleteDialogOpen(false)
    setSelectedCompany(null)
    refetch()
  }

  const handleToggleVisible = async (company: Company) => {
    try {
      const supabase = (await import('@/shared/lib/supabase/client')).createClient()
      const { error } = await supabase
        .from('companies')
        .update({ visible: !company.visible })
        .eq('id', company.id)

      if (error) throw error
      refetch()
    } catch (err) {
      console.error('Error al cambiar visibilidad:', err)
    }
  }

  const handleToggleEnabled = async (company: Company) => {
    try {
      const supabase = (await import('@/shared/lib/supabase/client')).createClient()
      const { error } = await supabase
        .from('companies')
        .update({ enabled: !company.enabled })
        .eq('id', company.id)

      if (error) throw error
      refetch()
    } catch (err) {
      console.error('Error al cambiar estado activo:', err)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200"
          />
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-gray-900 hover:bg-gray-800 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Empresa
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="text-destructive text-sm">
          Error al cargar empresas: {error}
        </div>
      ) : filteredCompanies.length === 0 ? (
        <Empty title="No hay empresas" />
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-900">
              <TableRow className="hover:bg-gray-900 h-12">
                <TableHead className="text-white">Empresa</TableHead>
                <TableHead className="text-white">Slug</TableHead>
                <TableHead className="text-white">Colores</TableHead>
                <TableHead className="text-white">Estado</TableHead>
                <TableHead className="text-right text-white">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company, index) => (
                <TableRow key={company.id} className={`h-12 border-0 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center">
                        {company.logo_url ? (
                          <img src={company.logo_url} alt={company.name} className="h-full w-full object-cover rounded" />
                        ) : (
                          <Building2 className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                      <span className="font-medium">{company.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">
                    {company.slug}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: company.primary_color }}
                        title={`Primary: ${company.primary_color}`}
                      />
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: company.secondary_color }}
                        title={`Secondary: ${company.secondary_color}`}
                      />
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: company.accent_color }}
                        title={`Accent: ${company.accent_color}`}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => handleToggleVisible(company)}
                        className="hover:opacity-70 transition-opacity"
                        title={company.visible ? "Click para ocultar" : "Click para hacer visible"}
                      >
                        {company.visible ? (
                          <Eye className="h-5 w-5 text-green-600" />
                        ) : (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleToggleEnabled(company)}
                        className="hover:opacity-70 transition-opacity"
                        title={company.enabled ? "Click para desactivar" : "Click para activar"}
                      >
                        {company.enabled ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditCompany(company)}
                      className="h-8 w-8"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCompany(company)}
                      className="h-8 w-8"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialogs */}
      <CompanyDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSaved={handleCompanySaved}
      />

      <CompanyDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        company={selectedCompany}
        onSaved={handleCompanySaved}
      />

      <DeleteCompanyDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        company={selectedCompany}
        onDeleted={handleCompanyDeleted}
      />
    </div>
  )
}
