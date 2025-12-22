'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useCompanies } from '@/features/companies/hooks/useCompanies'
import { createClient } from '@/shared/lib/supabase/client'
import type { Profile } from '../hooks/useProfiles'

interface ManageUserCompaniesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: Profile | null
    onCompaniesUpdated: () => void
}

export function ManageUserCompaniesDialog({
    open,
    onOpenChange,
    user,
    onCompaniesUpdated
}: ManageUserCompaniesDialogProps) {
    const { companies, isLoading: companiesLoading } = useCompanies()
    const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isFetchingUserCompanies, setIsFetchingUserCompanies] = useState(false)

    // Cargar empresas actuales del usuario
    useEffect(() => {
        if (open && user) {
            fetchUserCompanies()
        } else if (!open) {
            // Reset cuando se cierra el modal
            setSelectedCompanyIds([])
        }
    }, [open, user])

    const fetchUserCompanies = async () => {
        if (!user) return

        try {
            setIsFetchingUserCompanies(true)
            const supabase = createClient()

            const { data, error } = await supabase
                .from('user_companies')
                .select('company_id')
                .eq('profile_id', user.id)

            if (error) throw error

            const companyIds = data?.map(uc => uc.company_id) || []
            setSelectedCompanyIds(companyIds)
        } catch (error) {
            console.error('Error al cargar empresas del usuario:', error)
        } finally {
            setIsFetchingUserCompanies(false)
        }
    }

    const handleToggleCompany = (companyId: string) => {
        setSelectedCompanyIds(prev => {
            if (prev.includes(companyId)) {
                return prev.filter(id => id !== companyId)
            } else {
                return [...prev, companyId]
            }
        })
    }

    const handleSave = async () => {
        if (!user) return

        try {
            setIsLoading(true)
            const supabase = createClient()

            // Obtener todas las asociaciones existentes del usuario
            const { data: existingAssociations, error: fetchError } = await supabase
                .from('user_companies')
                .select('company_id, id')
                .eq('profile_id', user.id)

            if (fetchError) throw fetchError

            const existingCompanyIds = existingAssociations?.map(a => a.company_id) || []

            // Asociaciones a insertar (nuevas)
            const companiesToInsert = selectedCompanyIds.filter(id => !existingCompanyIds.includes(id))

            // Asociaciones a eliminar (existen pero no están seleccionadas)
            const companiesToDelete = existingCompanyIds.filter(id => !selectedCompanyIds.includes(id))

            // Insertar nuevas asociaciones
            if (companiesToInsert.length > 0) {
                // Obtener nombres de empresas para generar keys
                const companyNames = new Map(companies.map(c => [c.id, c.name]))

                const newAssociations = companiesToInsert.map(companyId => ({
                    profile_id: user.id,
                    company_id: companyId,
                    key: `${user.email}_${companyNames.get(companyId)}`
                }))

                const { error: insertError } = await supabase
                    .from('user_companies')
                    .insert(newAssociations)

                if (insertError) throw insertError
            }

            // Eliminar asociaciones no seleccionadas
            if (companiesToDelete.length > 0) {
                const { error: deleteError } = await supabase
                    .from('user_companies')
                    .delete()
                    .in('company_id', companiesToDelete)
                    .eq('profile_id', user.id)

                if (deleteError) throw deleteError
            }

            onCompaniesUpdated()
            onOpenChange(false)
        } catch (error) {
            console.error('Error al guardar empresas:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-white">
                <DialogHeader>
                    <DialogTitle>Gestionar Empresas</DialogTitle>
                    <p className="text-sm text-gray-400 mt-1">
                        Asigna una o más empresas al usuario
                    </p>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Usuario info */}
                    <div>
                        <p className="text-sm font-normal">Usuario</p>
                        <p className="text-sm text-gray-400">
                            {user?.fullName} ({user?.email})
                        </p>
                    </div>

                    {/* Empresas disponibles */}
                    <div>
                        <p className="text-sm font-normal mb-3">Empresas disponibles</p>

                        {companiesLoading || isFetchingUserCompanies ? (
                            <div className="text-sm text-muted-foreground">Cargando empresas...</div>
                        ) : (
                            <div className="space-y-1 border border-gray-200 rounded-lg p-2 max-h-[300px] overflow-y-auto">
                                {companies.map((company) => (
                                    <div
                                        key={company.id}
                                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50"
                                    >
                                        <Checkbox
                                            id={`company-${company.id}`}
                                            checked={selectedCompanyIds.includes(company.id)}
                                            onCheckedChange={() => handleToggleCompany(company.id)}
                                        />
                                        <label
                                            htmlFor={`company-${company.id}`}
                                            className="flex-1 text-sm text-gray-900 font-normal cursor-pointer"
                                        >
                                            {company.name}
                                        </label>
                                    </div>
                                ))}
                                {companies.length === 0 && (
                                    <p className="text-sm text-gray-500 p-2 text-center">No hay empresas disponibles</p>
                                )}
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-gray-400">
                        El usuario podrá acceder a la información de las empresas seleccionadas
                    </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="bg-gray-900 hover:bg-gray-800 text-white"
                    >
                        {isLoading ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
