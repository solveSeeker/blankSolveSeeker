'use client'

import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useCompanies } from '@/features/companies/hooks/useCompanies'
import { createClient } from '@/shared/lib/supabase/client'
import { cn } from '@/shared/utils'
import type { Profile } from '../hooks/useProfiles'
import { DisabledCompaniesWarningDialog } from './disabled-companies-warning-dialog'

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
    const [showDisabledWarning, setShowDisabledWarning] = useState(false)
    const [pendingSaveData, setPendingSaveData] = useState<{
        companiesToInsert: string[]
        companiesToDelete: string[]
        disabledCompaniesToDelete: string[]
    } | null>(null)

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

    // Categorizar empresas según estado y asociación
    const categorizedCompanies = useMemo(() => {
        if (!companies.length) return {
            enabled: [],
            disabledAssociated: [],
            disabledNotAssociated: []
        }

        return {
            enabled: companies.filter(c => c.enabled === true),
            disabledAssociated: companies.filter(
                c => c.enabled === false && selectedCompanyIds.includes(c.id)
            ),
            disabledNotAssociated: companies.filter(
                c => c.enabled === false && !selectedCompanyIds.includes(c.id)
            )
        }
    }, [companies, selectedCompanyIds])

    // Lista final a mostrar (habilitadas + deshabilitadas asociadas)
    const displayCompanies = useMemo(() => {
        return [...categorizedCompanies.enabled, ...categorizedCompanies.disabledAssociated]
    }, [categorizedCompanies])

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

            const { data: existingAssociations, error: fetchError } = await supabase
                .from('user_companies')
                .select('company_id, id')
                .eq('profile_id', user.id)

            if (fetchError) throw fetchError

            const existingCompanyIds = existingAssociations?.map(a => a.company_id) || []
            const companiesToInsert = selectedCompanyIds.filter(id => !existingCompanyIds.includes(id))
            const companiesToDelete = existingCompanyIds.filter(id => !selectedCompanyIds.includes(id))

            // Detectar empresas deshabilitadas que se están quitando
            const disabledCompaniesToDelete = companiesToDelete.filter(companyId => {
                const company = companies.find(c => c.id === companyId)
                return company && !company.enabled
            })

            // Si hay empresas deshabilitadas para quitar, mostrar advertencia
            if (disabledCompaniesToDelete.length > 0) {
                setPendingSaveData({
                    companiesToInsert,
                    companiesToDelete,
                    disabledCompaniesToDelete
                })
                setShowDisabledWarning(true)
                setIsLoading(false)
                return
            }

            await executeSave(companiesToInsert, companiesToDelete)

        } catch (error) {
            console.error('Error al guardar empresas:', error)
            setIsLoading(false)
        }
    }

    const executeSave = async (companiesToInsert: string[], companiesToDelete: string[]) => {
        try {
            setIsLoading(true)
            const supabase = createClient()

            if (companiesToInsert.length > 0) {
                const companyNames = new Map(companies.map(c => [c.id, c.name]))
                const newAssociations = companiesToInsert.map(companyId => ({
                    profile_id: user!.id,
                    company_id: companyId,
                    key: `${user!.email}_${companyNames.get(companyId)}`
                }))

                const { error: insertError } = await supabase
                    .from('user_companies')
                    .insert(newAssociations)

                if (insertError) throw insertError
            }

            if (companiesToDelete.length > 0) {
                const { error: deleteError } = await supabase
                    .from('user_companies')
                    .delete()
                    .in('company_id', companiesToDelete)
                    .eq('profile_id', user!.id)

                if (deleteError) throw deleteError
            }

            onCompaniesUpdated()
            onOpenChange(false)
        } catch (error) {
            console.error('Error al guardar empresas:', error)
        } finally {
            setIsLoading(false)
            setPendingSaveData(null)
        }
    }

    const handleConfirmSaveWithDisabled = async () => {
        if (!pendingSaveData) return
        setShowDisabledWarning(false)
        await executeSave(pendingSaveData.companiesToInsert, pendingSaveData.companiesToDelete)
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
                                {displayCompanies.map((company) => {
                                    const isDisabled = !company.enabled

                                    return (
                                        <div
                                            key={company.id}
                                            className={cn(
                                                "flex items-center space-x-2 p-2 rounded-lg",
                                                isDisabled ? "bg-gray-100" : "hover:bg-gray-50"
                                            )}
                                        >
                                            <Checkbox
                                                id={`company-${company.id}`}
                                                checked={selectedCompanyIds.includes(company.id)}
                                                onCheckedChange={() => handleToggleCompany(company.id)}
                                                className={isDisabled ? "opacity-70" : ""}
                                            />
                                            <label
                                                htmlFor={`company-${company.id}`}
                                                className={cn(
                                                    "flex-1 text-sm font-normal cursor-pointer flex items-center gap-2",
                                                    isDisabled ? "text-gray-600" : "text-gray-900"
                                                )}
                                            >
                                                {company.name}
                                                {isDisabled && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Deshabilitada
                                                    </Badge>
                                                )}
                                            </label>
                                        </div>
                                    )
                                })}
                                {displayCompanies.length === 0 && (
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

            <DisabledCompaniesWarningDialog
                isOpen={showDisabledWarning}
                onOpenChange={setShowDisabledWarning}
                companyNames={
                    pendingSaveData?.disabledCompaniesToDelete.map(
                        id => companies.find(c => c.id === id)?.name || ''
                    ).filter(Boolean) || []
                }
                onConfirm={handleConfirmSaveWithDisabled}
                isLoading={isLoading}
            />
        </Dialog>
    )
}
