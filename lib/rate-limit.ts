// Rate limiter simples em memória, por processo/instância -- não usa
// Redis/infra externa. Zera a cada deploy/restart e não é compartilhado
// entre instâncias caso haja mais de uma rodando (edge/serverless com
// múltiplas réplicas). É suficiente para reduzir abuso automatizado
// básico; não é uma garantia dura contra um atacante distribuído.

const buckets = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()

  // limpeza esporádica: evita que o Map cresça sem limite na vida da instância
  if (Math.random() < 0.01) {
    for (const [k, entry] of buckets) {
      if (now > entry.resetTime) buckets.delete(k)
    }
  }

  const record = buckets.get(key)
  if (!record || now > record.resetTime) {
    buckets.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= limit) return false
  record.count++
  return true
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown"
}
