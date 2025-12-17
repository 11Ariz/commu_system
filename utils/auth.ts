// Simple auth helpers (placeholders). Replace with real auth (Firebase, Supabase, JWT)
export type Role = 'student' | 'teacher' | 'researcher' | 'admin'

export function getUserRole(): Role {
  // placeholder: read from cookie/localStorage or token
  return (typeof window !== 'undefined' && (localStorage.getItem('role') as Role)) || 'student'
}

export function setUserRole(role: Role) {
  if (typeof window !== 'undefined') localStorage.setItem('role', role)
}
