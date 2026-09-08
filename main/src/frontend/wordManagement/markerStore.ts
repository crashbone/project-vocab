import type { WordModel } from '@/wordManagement/WordModel'

// Highlight (double click marker) kalici degildir -- backend'de `words` duz metindir.
// Bu yuzden sayfa bazinda localStorage'da tutulur. Anahtar kelimenin kendisidir,
// satir indeksi degil: edit modunda ekleme/cikarma yapilsa da birebir ayni kalan
// kelimelerin isareti korunur, degisen kelime isaretini kaybeder.
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
    // kota/gizli mod: highlight sadece bu oturumda yasar
  }
}
