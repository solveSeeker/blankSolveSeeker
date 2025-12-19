'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-medium">Apariencia</h3>
        <p className="text-sm text-gray-500">
          Personaliza la apariencia del dashboard
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-4 border-b border-gray-200">
          <div className="space-y-0.5">
            <Label htmlFor="dark-mode" className="text-base font-medium cursor-pointer">
              Modo oscuro
            </Label>
            <p className="text-sm text-gray-500">
              Activa el tema oscuro
            </p>
          </div>
          <Checkbox
            id="dark-mode"
            checked={darkMode}
            onCheckedChange={(checked) => setDarkMode(checked as boolean)}
          />
        </div>
      </div>
    </div>
  )
}
