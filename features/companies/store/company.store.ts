import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Company, CompanyListItem } from '../types'
import { companyService } from '../services'

interface CompanyState {
  // State
  companies: Company[]
  activeCompany: Company | null
  isLoading: boolean
  error: string | null

  // Actions
  fetchCompanies: () => Promise<void>
  setActiveCompany: (company: Company | null) => void
  setActiveCompanyById: (companyId: string) => Promise<void>
  getCompanyById: (id: string) => Promise<Company | null>
  clearError: () => void
  reset: () => void
}

const initialState = {
  companies: [],
  activeCompany: null,
  isLoading: false,
  error: null,
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchCompanies: async () => {
        set({ isLoading: true, error: null })
        try {
          const companies = await companyService.getAll()
          set({ companies, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error fetching companies',
            isLoading: false,
          })
        }
      },

      setActiveCompany: (company) => {
        set({ activeCompany: company })
      },

      setActiveCompanyById: async (companyId) => {
        set({ isLoading: true, error: null })
        try {
          const company = await companyService.getById(companyId)
          set({ activeCompany: company, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error fetching company',
            isLoading: false,
          })
        }
      },

      getCompanyById: async (id) => {
        try {
          return await companyService.getById(id)
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error fetching company',
          })
          return null
        }
      },

      clearError: () => set({ error: null }),

      reset: () => set(initialState),
    }),
    {
      name: 'company-storage',
      partialize: (state) => ({
        activeCompany: state.activeCompany,
      }),
    }
  )
)
