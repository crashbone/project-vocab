export enum Difficulty {
  EASY = 0,
  MEDIUM = 1,
  HARD = 2,
  BRUTAL = 3,
  CUSTOM = 4,
}

export const DIFFICULTY_NAMES: Record<Difficulty, string> = {
  [Difficulty.EASY]: 'Easy',
  [Difficulty.MEDIUM]: 'Medium',
  [Difficulty.HARD]: 'Hard',
  [Difficulty.BRUTAL]: 'Brutal',
  [Difficulty.CUSTOM]: 'Custom',
}

// Soru basina verilen sure (saniye): ilk soru `max`, son soru `min`.
export const DIFFICULTY_DURATION_RANGES: Record<Exclude<Difficulty, Difficulty.CUSTOM>, { min: number, max: number }> = {
  [Difficulty.EASY]: { min: 2.5, max: 8 },
  [Difficulty.MEDIUM]: { min: 1.75, max: 7 },
  [Difficulty.HARD]: { min: 1.25, max: 6 },
  [Difficulty.BRUTAL]: { min: 1, max: 5 },
}

export const DEFAULT_DIFFICULTY = Difficulty.MEDIUM
export const DIFFICULTY_LOCAL_STORAGE_KEY = 'multipleChoiceDifficulty'

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2

// i: 0'dan baslayan soru sirasi, n: toplam soru sayisi.
export const getQuestionDuration = (i: number, n: number, difficulty: Difficulty): number => {
  const { min, max } = difficulty === Difficulty.CUSTOM
    ? customToRange(loadCustomDuration())
    : DIFFICULTY_DURATION_RANGES[difficulty]
  if (n <= 1) return max
  return max - (max - min) * easeInOutSine(i / (n - 1))
}

export const loadDifficulty = (): Difficulty => {
  try {
    const stored = Number(localStorage.getItem(DIFFICULTY_LOCAL_STORAGE_KEY))
    if (localStorage.getItem(DIFFICULTY_LOCAL_STORAGE_KEY) !== null && stored in DIFFICULTY_NAMES) {
      return stored as Difficulty
    }
  } catch { /* localStorage erisilemiyorsa default */ }
  return DEFAULT_DIFFICULTY
}

/* === CUSTOM: ilk / son soru suresi (saniye), kullanici girer === */

export interface CustomDuration { first: number, last: number }

export const CUSTOM_DURATION_LOCAL_STORAGE_KEY = 'multipleChoiceCustomDuration'
export const DEFAULT_CUSTOM_DURATION: CustomDuration = { first: 7, last: 1.75 }
// Slider 0..CUSTOM_SLIDER_MAX; input'a daha buyuk / ondalikli deger yazilabilir.
export const CUSTOM_SLIDER_MAX = 100

const customToRange = (c: CustomDuration) => ({ min: c.last, max: c.first })

// 0 / negatif yok, son soru suresi ilk sorudan uzun olamaz.
export const isValidCustomDuration = (c: CustomDuration): boolean =>
  Number.isFinite(c.first) && Number.isFinite(c.last) && c.first > 0 && c.last > 0 && c.last <= c.first

export const loadCustomDuration = (): CustomDuration => {
  try {
    const raw = localStorage.getItem(CUSTOM_DURATION_LOCAL_STORAGE_KEY)
    if (raw !== null) {
      const c = JSON.parse(raw) as CustomDuration
      if (isValidCustomDuration(c)) return { first: c.first, last: c.last }
    }
  } catch { /* localStorage erisilemiyorsa default */ }
  return { ...DEFAULT_CUSTOM_DURATION }
}

export const saveCustomDuration = (c: CustomDuration) => {
  try {
    localStorage.setItem(CUSTOM_DURATION_LOCAL_STORAGE_KEY, JSON.stringify(c))
  } catch { /* sadece bu oturumda gecerli */ }
}

/* === RANDOM: soru sirasi karisik mi (siklar her zaman karisik) === */

export const RANDOM_LOCAL_STORAGE_KEY = 'multipleChoiceRandom'
export const DEFAULT_RANDOM = true

export const loadRandom = (): boolean => {
  try {
    const raw = localStorage.getItem(RANDOM_LOCAL_STORAGE_KEY)
    if (raw !== null) return raw === 'true'
  } catch { /* default */ }
  return DEFAULT_RANDOM
}

export const saveRandom = (value: boolean) => {
  try {
    localStorage.setItem(RANDOM_LOCAL_STORAGE_KEY, String(value))
  } catch { /* sadece bu oturumda gecerli */ }
}

/* === Cevap geri bildirimi === */

// Cevaptan sonra dogru/yanlis animasyonunun gorundugu sure; soru suresinden yemez.
export const ANSWER_FEEDBACK_MS = 1000
