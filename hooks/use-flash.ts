"use client"

import { useEffect, useState } from "react"
import { flashManager, type FlashMessage } from "@/lib/flash"

export function useFlash() {
  const [messages, setMessages] = useState<FlashMessage[]>([])

  useEffect(() => {
    return flashManager.subscribe(setMessages)
  }, [])

  return {
    messages,
    remove: (id: string) => flashManager.remove(id),
  }
}
