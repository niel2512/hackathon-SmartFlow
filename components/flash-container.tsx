"use client"

import { useFlash } from "@/hooks/use-flash"

export function FlashContainer() {
  const { messages, remove } = useFlash()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`p-4 rounded-lg shadow-lg text-sm font-medium animate-in fade-in slide-in-from-right-2 ${
            msg.type === "success"
              ? "bg-green-500 text-white"
              : msg.type === "error"
                ? "bg-red-500 text-white"
                : msg.type === "warning"
                  ? "bg-yellow-500 text-white"
                  : "bg-blue-500 text-white"
          }`}
        >
          <div className="flex justify-between items-center">
            <span>{msg.message}</span>
            <button onClick={() => remove(msg.id)} className="ml-3 text-lg leading-none opacity-70 hover:opacity-100">
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
