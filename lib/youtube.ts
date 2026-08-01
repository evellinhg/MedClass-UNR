const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "youtube-nocookie.com", "www.youtube-nocookie.com"])

// Aceita link de playlist (youtube.com/playlist?list=...), de vídeo
// (youtube.com/watch?v=..., youtu.be/...) ou já um link de embed, e
// retorna a URL pronta para um <iframe src="...">. Usa o domínio
// youtube-nocookie.com (modo privacidade avançada) em todos os casos.
export function getYoutubeEmbedUrl(rawUrl: string): string | null {
  let url: URL
  try {
    url = new URL(rawUrl.trim())
  } catch {
    return null
  }

  if (!YOUTUBE_HOSTS.has(url.hostname)) return null

  if (url.pathname.startsWith("/embed/")) {
    return `https://www.youtube-nocookie.com${url.pathname}${url.search}`
  }

  if (url.hostname === "youtu.be") {
    const videoId = url.pathname.slice(1)
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null
  }

  const videoId = url.searchParams.get("v")
  const listId = url.searchParams.get("list")

  if (videoId) {
    return listId
      ? `https://www.youtube-nocookie.com/embed/${videoId}?list=${listId}`
      : `https://www.youtube-nocookie.com/embed/${videoId}`
  }

  if (url.pathname === "/playlist" && listId) {
    return `https://www.youtube-nocookie.com/embed/videoseries?list=${listId}`
  }

  return null
}
