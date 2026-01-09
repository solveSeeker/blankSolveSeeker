'use client'

import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useCompanies } from '@/features/companies/hooks/useCompanies'
import { useMutateUserCompany } from '../hooks/useMutateUserCompany'
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
    const { fetchByProfile, fetchAllByProfile, insert, updateStatus, remove, isLoading: isMutating } = useMutateUserCompany()
    const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([])
    const [isFetchingUserCompanies, setIsFetchingUserCompanies] = useState(false)
    const [showDisabledWarning, setShowDisabledWarning] = useState(false)
    const [pendingSaveData, setPendingSaveData] = useState<{
        companiesToInsert: string[]
        companiesToEnable: string[]
        companiesToDisable: string[]
        disabledCompaniesToDisable: string[]
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
            const userCompanies = await fetchByProfile(user.id)
            const companyIds = userCompanies.map(uc => uc.company_id)
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
            // Obtener todas las asociaciones existentes (enabled y disabled)
            const existingAssociations = await fetchAllByProfile(user.id)
            const existingCompanyIds = existingAssociations.map(a => a.company_id)

            // Empresas a insertar (nuevas que no existen)
            const companiesToInsert = selectedCompanyIds.filter(id => !existingCompanyIds.includes(id))

            // Empresas a habilitar (existen pero deben estar enabled)
            const companiesToEnable = selectedCompanyIds.filter(id => existingCompanyIds.includes(id))

            // Empresas a deshabilitar (existen pero NO están seleccionadas)
            const companiesToDisable = existingCompanyIds.filter(id => !selectedCompanyIds.includes(id))

            // Detectar empresas deshabilitadas que se están quitando
            const disabledCompaniesToDisable = companiesToDisable.filter(companyId => {
                const company = companies.find(c => c.id === companyId)
                return company && !company.enabled
            })

            // Si hay empresas deshabilitadas para quitar, mostrar advertencia
            if (disabledCompaniesToDisable.length > 0) {
                setPendingSaveData({
                    companiesToInsert,
                    companiesToEnable,
                    companiesToDisable,
                    disabledCompaniesToDisable
                })
                setShowDisabledWarning(true)
                return
            }

            await executeSave(companiesToInsert, companiesToEnable, companiesToDisable)

        } catch (error) {
            console.error('Error al guardar empresas:', error)
        }
    }

    const executeSave = async (companiesToInsert: string[], companiesToEnable: string[], companiesToDisable: string[]) => {
        try {
            // Insertar nuevas empresas con enabled=true y relatedObjects
            if (companiesToInsert.length > 0) {
                const companyNamesMap = new Map(companies.map(c => [c.id, c.name]))

                // Construir inputs con email y name para relatedObjects
                const insertInputs = companiesToInsert.map(companyId => ({
                    profileId: user!.id,
                    profileEmail: user!.email,  // ✅ Necesario para relatedObjects
                    companyId: companyId,
                    companyName: companyNamesMap.get(companyId) || '',  // ✅ Necesario para relatedObjects
                    enabled: true,
                    visible: true
                }))

                console.log('🔍 DEBUG - Ejecutando INSERT con relatedObjects')
                await insert(insertInputs)
            }

            // Habilitar empresas existentes
            if (companiesToEnable.length > 0) {
                console.log('🔍 DEBUG - Ejecutando UPDATE para HABILITAR:', companiesToEnable)
                await updateStatus({
                    profileId: user!.id,
                    companyIds: companiesToEnable,
                    enabled: true
                })
            }

            // Deshabilitar empresas no seleccionadas
            if (companiesToDisable.length > 0) {
                console.log('🔍 DEBUG - Ejecutando UPDATE para DESHABILITAR:', companiesToDisable)
                await updateStatus({
                    profileId: user!.id,
                    companyIds: companiesToDisable,
                    enabled: false
                })
            }

            console.log('🔍 DEBUG - Operaciones completadas, cerrando diálogo')
            onCompaniesUpdated()
            onOpenChange(false)
        } catch (error) {
            console.error('Error al guardar empresas:', error)
        } finally {
            setPendingSaveData(null)
        }
    }

    const handleConfirmSaveWithDisabled = async () => {
        if (!pendingSaveData) return
        setShowDisabledWarning(false)
        await executeSave(pendingSaveData.companiesToInsert, pendingSaveData.companiesToEnable, pendingSaveData.companiesToDisable)
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
                        disabled={isMutating}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isMutating}
                        className="bg-gray-900 hover:bg-gray-800 text-white"
                    >
                        {isMutating ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                </div>
            </DialogContent>

            <DisabledCompaniesWarningDialog
                isOpen={showDisabledWarning}
                onOpenChange={setShowDisabledWarning}
                companyNames={
                    pendingSaveData?.disabledCompaniesToDisable.map(
                        companyId => companies.find(c => c.id === companyId)?.name || ''
                    ).filter(Boolean) || []
                }
                onConfirm={handleConfirmSaveWithDisabled}
                isLoading={isMutating}
            />
        </Dialog>
    )
}
