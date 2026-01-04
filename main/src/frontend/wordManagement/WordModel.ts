import { enumLength } from "@/junk/util/enumLength"
import { WordMode } from "@/wordManagement/WordMode"

export type WordModelConstructor = {
  artikel?: string,
  context: string,
  marker: boolean,
  meaning: string,
  mode?: WordMode,
  word: string
}

export class WordModel {
  artikel: string
  context: string
  marker: boolean
  meaning: string
  mode: WordMode
  word: string

  constructor(obj: WordModelConstructor) {
    this.artikel = obj.artikel || ""
    this.context = obj.context
    this.marker = obj.marker
    this.meaning = obj.meaning
    this.mode = obj.mode || WordMode.SHORT
    this.word = obj.word
  }

  get hasArtikel() {
    return this.artikel.length > 0
  }

  nextMode() {
    const nextMode = ((this.mode + 1) % enumLength(WordMode)) as WordMode;
    this.switchMode(nextMode);
  }

  switchMode(mode: WordMode) {
    this.context = this.calculateContext(mode);
    this.mode = mode;
  }

  calculateContext(mode: WordMode): string {
    if (mode === WordMode.SHORT) {
      return this.word;
    }
    if (mode === WordMode.LONG) {
      return this.hasArtikel ? `${this.artikel} ${this.word} > ${this.meaning}` : `${this.word} > ${this.meaning}`;
    }
    return this.meaning;
  }

  setMarker(marker: boolean) {
    this.marker = marker;
  }
}