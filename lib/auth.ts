// Simple token-based auth
export const generateToken = (userId: string): string => {
  return `token_${userId}_${Date.now()}`
}

export const validateToken = (token: string): string | null => {
  const match = token.match(/^token_(\w+)_/)
  return match ? match[1] : null
}
