export enum Difficulty {
  EASY = 0,
  MEDIUM = 1,
  HARD = 2,
  // 3 used to be BRUTAL; CUSTOM stays at 4 so values saved in localStorage do not shift.
  CUSTOM = 4,
}

export const DIFFICULTY_NAMES: Record<Difficulty, string> = {
  [Difficulty.EASY]: 'Easy',
  [Difficulty.MEDIUM]: 'Medium',
  [Difficulty.HARD]: 'Hard',
  [Difficulty.CUSTOM]: 'Custom',
}

// Time per question (seconds): first question `max`, last question `min`.
export const DIFFICULTY_DURATION_RANGES: Record<Exclude<Difficulty, Difficulty.CUSTOM>, { min: number, max: number }> = {
  [Difficulty.EASY]: { min: 60, max: 60 },
  [Difficulty.MEDIUM]: { min: 15, max: 30 },
  [Difficulty.HARD]: { min: 1.5, max: 8 },
}

export const DEFAULT_DIFFICULTY = Difficulty.MEDIUM
export const DIFFICULTY_LOCAL_STORAGE_KEY = 'multipleChoiceDifficulty'

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2

// i: zero-based question index, n: total question count.
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
  } catch { /* default if localStorage is unavailable */ }
  return DEFAULT_DIFFICULTY
}

/* === CUSTOM: first / last question time (seconds), entered by the user === */

export interface CustomDuration { first: number, last: number }

export const CUSTOM_DURATION_LOCAL_STORAGE_KEY = 'multipleChoiceCustomDuration'
export const DEFAULT_CUSTOM_DURATION: CustomDuration = { first: 7, last: 1.75 }
// Slider 0..CUSTOM_SLIDER_MAX; larger / decimal values can be typed into the input.
export const CUSTOM_SLIDER_MAX = 100

const customToRange = (c: CustomDuration) => ({ min: c.last, max: c.first })

// No 0 / negatives; the last question time cannot exceed the first.
export const isValidCustomDuration = (c: CustomDuration): boolean =>
  Number.isFinite(c.first) && Number.isFinite(c.last) && c.first > 0 && c.last > 0 && c.last <= c.first

export const loadCustomDuration = (): CustomDuration => {
  try {
    const raw = localStorage.getItem(CUSTOM_DURATION_LOCAL_STORAGE_KEY)
    if (raw !== null) {
      const c = JSON.parse(raw) as CustomDuration
      if (isValidCustomDuration(c)) return { first: c.first, last: c.last }
    }
  } catch { /* default if localStorage is unavailable */ }
  return { ...DEFAULT_CUSTOM_DURATION }
}

export const saveCustomDuration = (c: CustomDuration) => {
  try {
    localStorage.setItem(CUSTOM_DURATION_LOCAL_STORAGE_KEY, JSON.stringify(c))
  } catch { /* applies to this session only */ }
}

/* === RANDOM: whether question order is shuffled (answers are always shuffled) === */

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
  } catch { /* applies to this session only */ }
}

/* === Answer feedback === */

// How long the correct/wrong animation shows after answering; not taken from the question time.
export const ANSWER_FEEDBACK_MS = 1000
