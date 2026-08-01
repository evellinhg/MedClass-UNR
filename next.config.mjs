const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const supabaseWs = supabaseUrl.replace(/^https/, "wss")
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : ""

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseUrl} https://*.ytimg.com`,
  `media-src 'self' ${supabaseUrl}`,
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseUrl} ${supabaseWs} https://va.vercel-scripts.com https://vitals.vercel-insights.com`,
  "frame-src https://www.youtube-nocookie.com",
  "object-src 'none'",
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: supabaseHostname
      ? [{ protocol: "https", hostname: supabaseHostname, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  async headers() {
    // So aplica em producao: Turbopack/HMR do dev server pode depender de eval
    // e outros padroes que uma CSP estrita bloquearia, quebrando o `npm run dev`.
    if (process.env.NODE_ENV !== "production") return []
    return [{ source: "/(.*)", headers: securityHeaders }]
  },
}

export default nextConfig
