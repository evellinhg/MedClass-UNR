"use client"

import { useRef, useState } from "react"
import { Loader2, Send, User, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ANO_KEYS } from "@/lib/unr-curriculum"
import { useLanguage } from "@/lib/i18n"

const FOTO_MAX_BYTES = 5 * 1024 * 1024
const FOTO_ACCEPT = "image/*"

export function DepoimentoForm() {
  const { t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [nome, setNome] = useState("")
  const [ano, setAno] = useState("")
  const [comentario, setComentario] = useState("")
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [fotoError, setFotoError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [status, setStatus] = useState<"idle" | "sucesso" | "erro">("idle")

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setFotoError(null)
    if (file && file.size > FOTO_MAX_BYTES) {
      setFotoError(t.testimonials.form.erroFoto)
      setFotoFile(null)
      setFotoPreview(null)
      e.target.value = ""
      return
    }
    setFotoFile(file)
    setFotoPreview(file ? URL.createObjectURL(file) : null)
  }

  const handleRemoveFoto = () => {
    setFotoFile(null)
    setFotoPreview(null)
    setFotoError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim() || !ano || !comentario.trim()) {
      setStatus("erro")
      return
    }

    setEnviando(true)
    setStatus("idle")

    let fotoPath: string | null = null
    if (fotoFile) {
      const safeName = fotoFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")
      const path = `${crypto.randomUUID()}-${safeName}`
      const { error: uploadError } = await supabase.storage
        .from("depoimentos-fotos")
        .upload(path, fotoFile, { contentType: fotoFile.type || undefined })

      if (uploadError) {
        setEnviando(false)
        setStatus("erro")
        return
      }
      fotoPath = path
    }

    const { error } = await supabase.from("depoimentos").insert({
      nome: nome.trim(),
      ano_cursado: ano,
      foto_path: fotoPath,
      comentario: comentario.trim(),
    })

    setEnviando(false)

    if (error) {
      setStatus("erro")
      return
    }

    setStatus("sucesso")
    setNome("")
    setAno("")
    setComentario("")
    handleRemoveFoto()
  }

  return (
    <div className="mx-auto mt-16 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
      <h3 className="text-xl font-bold text-white">{t.testimonials.form.titulo}</h3>
      <p className="mt-1 text-sm text-white/50">{t.testimonials.form.subtitulo}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/70">{t.testimonials.form.nome}</label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder={t.testimonials.form.nomePlaceholder}
              className="border-white/10 bg-white/[0.03] text-white placeholder:text-white/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/70">{t.testimonials.form.anoCursado}</label>
            <Select value={ano} onValueChange={setAno}>
              <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
                <SelectValue placeholder={t.testimonials.form.anoSelecione} />
              </SelectTrigger>
              <SelectContent>
                {ANO_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {t.cronograma.anoLabel[key] ?? key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/70">{t.testimonials.form.foto}</label>
          <div className="flex items-center gap-3">
            {fotoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fotoPreview} alt="" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white/30">
                <User className="h-5 w-5" />
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={FOTO_ACCEPT}
              onChange={handleFotoChange}
              className="hidden"
              id="depoimento-foto-input"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/10 hover:text-white"
            >
              {fotoFile ? t.testimonials.form.fotoTrocar : t.testimonials.form.fotoSelecionar}
            </Button>
            {fotoFile && (
              <button
                type="button"
                onClick={handleRemoveFoto}
                aria-label={t.testimonials.form.fotoRemover}
                className="text-white/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {fotoError && <p className="mt-1 text-xs text-red-400">{fotoError}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/70">{t.testimonials.form.comentario}</label>
          <Textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder={t.testimonials.form.comentarioPlaceholder}
            className="min-h-[100px] border-white/10 bg-white/[0.03] text-white placeholder:text-white/30"
          />
        </div>

        {status === "erro" && (
          <p className="text-sm text-red-400">
            {!nome.trim() || !ano || !comentario.trim() ? t.testimonials.form.camposObrigatorios : t.testimonials.form.erro}
          </p>
        )}
        {status === "sucesso" && <p className="text-sm text-[#bef264]">{t.testimonials.form.sucesso}</p>}

        <Button
          type="submit"
          disabled={enviando}
          className="w-full gap-2 bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] text-[#0a1f00] hover:from-[#a3e635] hover:to-[#65a30d]"
        >
          {enviando ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.testimonials.form.enviando}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {t.testimonials.form.enviar}
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
