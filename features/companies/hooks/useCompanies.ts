import { useEffect } from 'react'
import { useCompanyStore } from '../store'

export function useCompanies() {
  const {
    companies,
    activeCompany,
    isLoading,
    error,
    fetchCompanies,
    setActiveCompany,
    setActiveCompanyById,
    clearError,
  } = useCompanyStore()

  useEffect(() => {
    if (companies.length === 0 && !isLoading) {
      fetchCompanies()
    }
  }, [companies.length, isLoading, fetchCompanies])

  return {
    companies,
    activeCompany,
    isLoading,
    error,
    fetchCompanies,
    setActiveCompany,
    setActiveCompanyById,
    clearError,
  }
}
