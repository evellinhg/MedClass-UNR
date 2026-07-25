export const ADMIN_EMAILS = ["leonardoac.alves@gmail.com", "leonardoac.alves2@gmail.com"]

export function isAdminEmail(email?: string | null) {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
