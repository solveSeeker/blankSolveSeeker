// Profile type matching the database schema
export interface Profile {
  id: string // References auth.users.id
  company_id: string
  role: string
  is_active: boolean
  created_at: string
}

// Extended profile with user data from auth.users
export interface UserProfile extends Profile {
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
    [key: string]: unknown
  }
}

// Input type for creating a profile
export interface CreateProfileInput {
  id: string // auth.users.id
  company_id: string
  role?: string
  is_active?: boolean
}

// Input type for updating a profile
export interface UpdateProfileInput {
  id: string
  company_id?: string
  role?: string
  is_active?: boolean
}

// Simplified user data for lists
export interface UserListItem {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: string
  is_active: boolean
}
