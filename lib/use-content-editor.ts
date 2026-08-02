"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { isAdminEmail } from "@/lib/admin-config"

/**
 * Admins e colaboradores podem editar conteúdo (questões, flashcards, casos
 * clínicos, videoaulas) direto nas páginas do aluno, sem precisar abrir o
 * painel /admin. Alunos comuns nunca veem os controles de edição.
 */
export function useIsContentEditor() {
  const [isEditor, setIsEditor] = useState(false)

  useEffect(() => {
    let ativo = true
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user
      if (!user) return
      if (isAdminEmail(user.email)) {
        if (ativo) setIsEditor(true)
        return
      }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
      if (ativo && (profile?.role === "admin" || profile?.role === "colaborador")) setIsEditor(true)
    })
    return () => {
      ativo = false
    }
  }, [])

  return isEditor
}
