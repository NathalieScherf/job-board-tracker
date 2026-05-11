const KEYS = {
  savedJobs: 'job-parser:saved-jobs',
  savedUrls: 'job-parser:saved-urls'
}

function isClient(): boolean {
  return typeof window !== 'undefined'
}

export function loadFromStorage<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  if (!isClient()) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    console.error('Failed to save to localStorage')
  }
}

export { KEYS }