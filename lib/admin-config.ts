const envEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? ""
export const ADMIN_EMAILS: string[] = envEmails
  ? envEmails.split(",").map((e) => e.trim().toLowerCase())
  : ["leonardoac.alves@gmail.com", "leonardoac.alves2@gmail.com"]

export function isAdminEmail(email?: string | null) {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
