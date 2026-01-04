import type { PageJSON } from "@/wordManagement/fetchPages";
import { WordMode } from "./WordMode";
import type { WordModel } from "./WordModel";

export class PageModel {
  id: number;
  name: string
  description: string
  wordModels: WordModel[]
  modeWords: WordMode
  timeSpentSeconds: number
  lastEntryAt: number

  constructor(pageJson: PageJSON, wordModels: WordModel[]) {
    this.id = pageJson.id;
    this.name = pageJson.name;
    this.description = pageJson.description;
    this.wordModels = wordModels;
    this.modeWords = WordMode.SHORT;
    this.timeSpentSeconds = pageJson.time_spent_seconds
    this.lastEntryAt = new Date(pageJson.last_entry_at).getTime()
  }

  get words() {
    return this.wordModels.map(word => word.word)
  }

  toggleAll() {
    const nextMode = ((this.modeWords + 1) % Object.keys(WordMode).length) as WordMode;
    this.wordModels.forEach((wordModel) => {
        wordModel.switchMode(nextMode);
    });
  }
}