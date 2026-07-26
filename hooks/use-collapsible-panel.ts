"use client"

import { useEffect, useState } from "react"

export function useCollapsiblePanel(storageKey: string) {
  const [pinned, setPinned] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setPinned(localStorage.getItem(storageKey) === "1")
    setHydrated(true)
  }, [storageKey])

  const togglePinned = () => {
    setPinned((prev) => {
      const next = !prev
      localStorage.setItem(storageKey, next ? "1" : "0")
      return next
    })
  }

  return {
    expanded: pinned || hovered,
    pinned,
    hydrated,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    togglePinned,
  }
}
