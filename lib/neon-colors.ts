// Paleta de cores neon usada para classificar visualmente playlists e
// videoaulas no admin e na página pública de Materiais > Videoaulas.
export const NEON_COLORS = [
  { label: "Lima", hex: "#c6ff3a" },
  { label: "Ciano", hex: "#22d3ee" },
  { label: "Fúcsia", hex: "#e879f9" },
  { label: "Âmbar", hex: "#fbbf24" },
  { label: "Violeta", hex: "#a78bfa" },
  { label: "Rosa", hex: "#fb7185" },
  { label: "Teal", hex: "#2dd4bf" },
  { label: "Azul", hex: "#60a5fa" },
  { label: "Verde", hex: "#4ade80" },
  { label: "Laranja", hex: "#fb923c" },
] as const

export function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
