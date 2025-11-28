export type FlashType = "success" | "error" | "info" | "warning"

export interface FlashMessage {
  id: string
  message: string
  type: FlashType
  timestamp: number
}

class FlashMessageManager {
  private messages: FlashMessage[] = []
  private listeners: ((messages: FlashMessage[]) => void)[] = []

  subscribe(callback: (messages: FlashMessage[]) => void) {
    this.listeners.push(callback)
    callback(this.messages)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback)
    }
  }

  add(message: string, type: FlashType = "info") {
    const id = Date.now().toString()
    const newMessage: FlashMessage = {
      id,
      message,
      type,
      timestamp: Date.now(),
    }
    this.messages = [newMessage, ...this.messages]
    this.notifyListeners()

    // Auto-remove after 4 seconds
    setTimeout(() => {
      this.remove(id)
    }, 4000)

    return id
  }

  remove(id: string) {
    this.messages = this.messages.filter((m) => m.id !== id)
    this.notifyListeners()
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.messages))
  }
}

export const flashManager = new FlashMessageManager()
