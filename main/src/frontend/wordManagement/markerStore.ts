import type { WordModel } from '@/wordManagement/WordModel'

// Highlight (double click marker) is not persisted -- in the backend `words` is plain text.
// So it is kept per page in localStorage. The key is the word itself,
// not the line index: even after adds/removes in edit mode, words that stay exactly the same
// keep their marker, a changed word loses it.
const storageKey = (pageId: number) => `vocab:markers:${pageId}`

export const wordMarkerKey = (word: WordModel): string => {
  const left = (word.hasArtikel ? `${word.artikel} ${word.word}` : word.word).trim()
  return `${left}|${(word.meaning ?? '').trim()}`
}

const readKeys = (pageId: number): Set<string> => {
  try {
    const raw = localStorage.getItem(storageKey(pageId))
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

export const applyMarkers = (pageId: number, words: WordModel[]) => {
  const keys = readKeys(pageId)
  if (keys.size === 0) return
  words.forEach(w => w.setMarker(keys.has(wordMarkerKey(w))))
}

export const saveMarkers = (pageId: number, words: WordModel[]) => {
  const keys = words.filter(w => w.marker).map(wordMarkerKey)
  try {
    if (keys.length === 0) {
      localStorage.removeItem(storageKey(pageId))
      return
    }
    localStorage.setItem(storageKey(pageId), JSON.stringify(keys))
  } catch {
    // quota/private mode: the highlight lives only in this session
  }
}
