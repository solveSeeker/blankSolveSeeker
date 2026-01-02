'use client'

import { useState, useEffect } from 'react'

/**
 * Hook para calcular el tamaño de página óptimo basado en el viewport disponible
 * Asegura que la tabla con paginación se vea completa sin scroll
 */
export function useOptimalPageSize() {
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    const calculateOptimalPageSize = () => {
      const viewportHeight = window.innerHeight

      // Alturas fijas conocidas (en px) - medidas más precisas
      const HEADER_HEIGHT = 64        // Header del dashboard
      const SEARCH_SECTION = 96       // Input de búsqueda + padding (más preciso)
      const TABLE_HEADER = 48         // Header de la tabla
      const PAGINATION_HEIGHT = 88    // Controles de paginación (más preciso)
      const BOTTOM_PADDING = 16       // Padding inferior
      const ROW_HEIGHT = 57           // Altura real de cada fila (incluyendo border)

      // Espacio disponible para las filas
      const availableHeight = viewportHeight -
        HEADER_HEIGHT -
        SEARCH_SECTION -
        TABLE_HEADER -
        PAGINATION_HEIGHT -
        BOTTOM_PADDING

      // Calcular número de filas que caben
      const maxRows = Math.floor(availableHeight / ROW_HEIGHT)

      // Limitar entre 5 y 20 filas
      const optimalSize = Math.max(5, Math.min(20, maxRows))

      setPageSize(optimalSize)
    }

    // Calcular al montar y cuando cambie el tamaño de ventana
    calculateOptimalPageSize()
    window.addEventListener('resize', calculateOptimalPageSize)

    return () => window.removeEventListener('resize', calculateOptimalPageSize)
  }, [])

  return pageSize
}
