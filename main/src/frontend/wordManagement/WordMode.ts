export enum WordMode {
  SHORT = 0,
  LONG = 1,
  MEANING = 2,
}
type WordModeNames = keyof typeof WordMode;


export const getModeName = (mode: WordMode): WordModeNames | undefined => {
    const entry = Object.entries(WordMode).find(([mName, mID]) => {
      if (mID === mode) return mName;
    }) as [WordModeNames, number] | undefined;
    if (entry) {
      return entry[0] as WordModeNames;
    }
    return undefined;
  }