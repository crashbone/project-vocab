import type { PageJSON } from "@/wordManagement/fetchPages";
import { WordMode } from "./WordMode";
import type { WordModel } from "./WordModel";
import { PageType } from "./PageType";
import type { MultipleChoiceQuestion } from "./wordManager";

export class PageModel {
  id: number;
  name: string
  description: string
  wordModels: WordModel[]
  modeWords: WordMode
  timeSpentSeconds: number
  lastEntryAt: number
  type: PageType
  // Sadece MULTIPLE_CHOICE sayfalarinda dolu; o zaman wordModels bostur.
  questions: MultipleChoiceQuestion[]

  constructor(pageJson: PageJSON, wordModels: WordModel[], questions: MultipleChoiceQuestion[] = []) {
    this.id = pageJson.id;
    this.name = pageJson.name;
    this.description = pageJson.description;
    this.wordModels = wordModels;
    this.modeWords = WordMode.SHORT;
    this.timeSpentSeconds = pageJson.time_spent_seconds
    this.lastEntryAt = new Date(pageJson.last_entry_at).getTime()
    this.type = pageJson.type ?? PageType.PAGE
    this.questions = questions
  }

  get words() {
    if (this.type === PageType.MULTIPLE_CHOICE) {
      return this.questions.map(q => q.question)
    }
    return this.wordModels.map(word => word.word)
  }

  toggleAll() {
    const nextMode = ((this.modeWords + 1) % Object.keys(WordMode).length) as WordMode;
    this.wordModels.forEach((wordModel) => {
        wordModel.switchMode(nextMode);
    });
  }
}