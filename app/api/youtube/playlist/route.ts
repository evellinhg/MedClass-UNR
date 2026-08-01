import { NextRequest, NextResponse } from "next/server"

interface PlaylistVideo {
  videoId: string
  title: string
  thumbnail: string
}

function decodeXmlEntities(text: string) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

// Usa o feed RSS público de playlists do YouTube (sem chave de API).
// Limitação conhecida: o YouTube só retorna os vídeos mais recentes da
// playlist por esse feed (geralmente até ~15).
export async function GET(request: NextRequest) {
  const listId = request.nextUrl.searchParams.get("list")
  if (!listId) {
    return NextResponse.json({ error: "Parâmetro 'list' obrigatório." }, { status: 400 })
  }

  const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${encodeURIComponent(listId)}`
  const res = await fetch(feedUrl, { next: { revalidate: 3600 } })
  if (!res.ok) {
    return NextResponse.json({ error: "Não foi possível carregar a playlist." }, { status: 502 })
  }

  const xml = await res.text()
  const entries = xml.split("<entry>").slice(1)

  const items: PlaylistVideo[] = entries
    .map((entry) => {
      const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ?? ""
      const title = entry.match(/<title>([^<]+)<\/title>/)?.[1] ?? ""
      const thumbnail = entry.match(/<media:thumbnail url="([^"]+)"/)?.[1] ?? ""
      return { videoId, title: decodeXmlEntities(title), thumbnail }
    })
    .filter((item) => item.videoId)

  return NextResponse.json({ items })
}
