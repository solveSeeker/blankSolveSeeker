export interface AuditLog {
  id: string
  nameTable: string | null
  updated: string | null
  userIdentifier: string | null
  userId: string | null
  currentUser: string | null
  beforeUpdate: Record<string, any> | null
  idObject: string | null
  afterUpdate: Record<string, any> | null
  diff: Record<string, any> | null
}
