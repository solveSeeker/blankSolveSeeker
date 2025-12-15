'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/shared/lib/supabase/client'
import type { Company, CreateCompanyInput, UpdateCompanyInput } from '../types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CompanyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company?: Company | null
  onSaved: () => void
}

export function CompanyDialog({ open, onOpenChange, company, onSaved }: CompanyDialogProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#001f3f')
  const [secondaryColor, setSecondaryColor] = useState('#0074D9')
  const [accentColor, setAccentColor] = useState('#FF4136')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!company

  useEffect(() => {
    if (company) {
      setName(company.name || '')
      setSlug(company.slug || '')
      setPrimaryColor(company.primary_color || '#001f3f')
      setSecondaryColor(company.secondary_color || '#0074D9')
      setAccentColor(company.accent_color || '#FF4136')
    } else {
      setName('')
      setSlug('')
      setPrimaryColor('#001f3f')
      setSecondaryColor('#0074D9')
      setAccentColor('#FF4136')
    }
    setError(null)
  }, [company, open])

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (!isEditing) {
      setSlug(generateSlug(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      if (isEditing && company) {
        // Update existing company
        const updateData: UpdateCompanyInput = {
          name,
          slug,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          accent_color: accentColor,
        }

        const { error: updateError } = await supabase
          .from('companies')
          .update(updateData)
          .eq('id', company.id)

        if (updateError) throw updateError
      } else {
        // Create new company
        const createData: CreateCompanyInput = {
          name,
          slug,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          accent_color: accentColor,
          settings: {},
        }

        const { error: insertError } = await supabase
          .from('companies')
          .insert(createData)

        if (insertError) throw insertError
      }

      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar empresa')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Empresa' : 'Nueva Empresa'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Actualiza la información de la empresa' : 'Crea una nueva empresa en el sistema'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Empresa</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Acme Inc."
              required
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="acme-inc"
              required
              pattern="[a-z0-9-]+"
              title="Solo letras minúsculas, números y guiones"
            />
            <p className="text-xs text-muted-foreground">
              Identificador único para URLs (solo letras minúsculas, números y guiones)
            </p>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Color Primario</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#001f3f"
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Color Secundario</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  placeholder="#0074D9"
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor">Color de Acento</Label>
              <div className="flex gap-2">
                <Input
                  id="accentColor"
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  placeholder="#FF4136"
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-gray-900 hover:bg-gray-800">
              {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
