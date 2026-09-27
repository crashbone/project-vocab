export enum Difficulty {
  EASY = 0,
  MEDIUM = 1,
  HARD = 2,
  BRUTAL = 3,
}

export const DIFFICULTY_NAMES: Record<Difficulty, string> = {
  [Difficulty.EASY]: 'Easy',
  [Difficulty.MEDIUM]: 'Medium',
  [Difficulty.HARD]: 'Hard',
  [Difficulty.BRUTAL]: 'Brutal',
}

// Soru basina verilen sure (saniye): ilk soru `max`, son soru `min`.
export const DIFFICULTY_DURATION_RANGES: Record<Difficulty, { min: number, max: number }> = {
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
  const { min, max } = DIFFICULTY_DURATION_RANGES[difficulty]
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
