import { WordModel } from '@/wordManagement/WordModel'
import { WordMode } from '@/wordManagement/WordMode'
import { splitByDelimiters } from '@/junk/util/splitByDelimiters'
import { itemsToRawText, sourceLine, type WithSource } from '@/wordManagement/sourceLine'

export type MultipleChoiceQuestion = {
  question: string
  answers: string[]
  correctIndex: number
} & WithSource

// One flash card row of the Standard View editors (PageAddPage, PageWords edit mode).
export type WordRow = {
  w1: string
  w1EditMode: boolean
  w2: string
  w2EditMode: boolean
} & WithSource

export type MultipleChoiceLineError = {
  lineNumber: number
  line: string
  reason: string
  fixed: string
}


export class WordManager {
  static _instance: WordManager | null = null;
  delimiters = ["\t", "    ", " | "]; // ["\t", "::", "//", "--", "__"],
  ARTIKELS = ["der", "die", "das"];
  // Chinese (CJK) character: to detect 'character | pinyin | meaning' lines.
  CJK_REGEX = /[㐀-鿿豈-﫿]/;

  private constructor() { }

  static get instance(): WordManager {
    if (!WordManager._instance) {
      WordManager._instance = new WordManager();
      window.wordManager = WordManager._instance
    }
    return WordManager._instance;
  }

  // Inverse of setupWords: turns the models back into raw text (' | ' separator, lines '\n').
  formatWordsForExport(words: WordModel[]): string {
    return words.map(w => {
      const word = (w.hasArtikel ? `${w.artikel} ${w.word}` : w.word).trim()
      const left = w.pinyin ? `${word} | ${w.pinyin}` : word
      const right = (w.meaning ?? '').trim()
      return right === '' ? left : `${left} | ${right}`
    }).filter(line => line !== '').join('\n')
  }

  // Standard View rows from word models; pinyin stays in the left box ('character | pinyin').
  wordRowFromModel(wm: WordModel): WordRow {
    const word = wm.hasArtikel ? `${wm.artikel} ${wm.word}` : wm.word
    const row: WordRow = { w1: wm.pinyin ? `${word} | ${wm.pinyin}` : word, w1EditMode: false, w2: wm.meaning, w2EditMode: false }
    if (wm.sourceLine !== undefined) row.source = sourceLine(wm.sourceLine, this.wordRowValues(row))
    return row
  }

  setupWordRows(allWords: string): WordRow[] {
    return this.setupWords(allWords).map(wm => this.wordRowFromModel(wm))
  }

  private wordRowValues(row: WordRow) {
    return [row.w1.trim(), row.w2.trim()]
  }

  // Inverse of setupWordRows: unchanged rows give their source line back, empty rows are skipped.
  formatWordRows(rows: WordRow[]): string {
    return itemsToRawText(rows, r => this.wordRowValues(r), ([w1, w2]) => (w2 === '' ? w1 : `${w1} | ${w2}`))
  }

  // Multiple choice pages: each line is "question | correct | wrong | wrong ...".
  // The first answer is always the correct one.
  // keepInvalid: the editor keeps invalid lines as typed (so they can be shown and fixed);
  // otherwise (quiz) lines failing validateMultipleChoice are skipped. Empty lines are always skipped.
  setupMultipleChoice(allQuestions: string, keepInvalid = false): MultipleChoiceQuestion[] {
    const questions: MultipleChoiceQuestion[] = [];
    allQuestions.split("\n").forEach(line => {
      if (line.trim() === '') return
      const { question, answers } = this.splitMultipleChoiceLine(line)
      if (!keepInvalid && this.multipleChoiceLineError(question, answers) !== null) return
      const q: MultipleChoiceQuestion = { question, answers, correctIndex: 0 }
      q.source = sourceLine(line, this.questionValues(q))
      questions.push(q)
    });
    return questions
  }

  private splitMultipleChoiceLine(line: string) {
    // A stray "|" at a part's edge (e.g. a trailing "a |") is not content.
    const parts = splitByDelimiters(line, this.delimiters).map(part => part.trim().replace(/^\|+|\|+$/g, '').trim())
    return { question: parts[0], answers: parts.slice(1).filter(part => part !== '') }
  }

  private multipleChoiceLineError(question: string, answers: string[]): string | null {
    if (question === '') return 'add a question'
    if (answers.length === 0) return 'add a correct and a wrong answer'
    if (answers.length === 1) return 'add at least one wrong answer'
    return null
  }

  // Per-line errors of multiple choice text; empty lines are ignored. fixed = the line with
  // placeholders filled in, offered to the user as a copyable example.
  // Must stay identical to main/src/backend/multiple_choice_validation.py (validate_multiple_choice).
  validateMultipleChoice(allQuestions: string): MultipleChoiceLineError[] {
    const errors: MultipleChoiceLineError[] = []
    allQuestions.split("\n").forEach((line, i) => {
      if (line.trim() === '') return
      const { question, answers } = this.splitMultipleChoiceLine(line)
      const reason = this.multipleChoiceLineError(question, answers)
      if (reason === null) return
      const fixed = [question || 'question?', answers[0] ?? 'correct answer',
        ...(answers.length > 1 ? answers.slice(1) : ['wrong answer'])].join(' | ')
      errors.push({ lineNumber: i + 1, line: line.trim(), reason, fixed })
    })
    return errors
  }

  // Errors of a single question as edited in Standard View (same rules as a raw line).
  multipleChoiceQuestionError(q: MultipleChoiceQuestion): string | null {
    return this.multipleChoiceLineError(q.question.trim(), q.answers.map(a => a.trim()).filter(a => a !== ''))
  }

  // Question, correct answer, wrong answers (trimmed, empty answers dropped).
  private questionValues(q: MultipleChoiceQuestion) {
    const answers = [q.answers[q.correctIndex] ?? '', ...q.answers.filter((_, i) => i !== q.correctIndex)]
    return [q.question.trim(), ...answers.map(a => a.trim()).filter(a => a !== '')]
  }

  // Inverse of setupMultipleChoice: the correct answer is written back as the first answer.
  // Unchanged questions give their source line back; empty questions are skipped.
  formatMultipleChoiceForExport(questions: MultipleChoiceQuestion[]): string {
    return itemsToRawText(questions, q => this.questionValues(q), values => values.join(' | '))
  }

  setupWords(allWords: string): WordModel[] {
    //whole string input splitted into array using "\n"
    const words: WordModel[] = [];
    const allWordsArray = allWords.split("\n")
    const warnings: string[] = [];
    allWordsArray.forEach(line => {
      const lineArray = splitByDelimiters(line, this.delimiters)
      if (lineArray.length === 1 && line.length < 3) {
        return words;
      }
      // Lines consisting only of the separator (' | ') must not produce empty words.
      if (lineArray.every(part => part.trim() === '')) {
        return words;
      }
      let wordModel: WordModel;

      //If first section of the line is artikel
      const disableArtikels = true;
      if (!disableArtikels && this.ARTIKELS.includes(lineArray[0])) { //first tab is artikel
        wordModel = new WordModel({
          artikel: lineArray[0].toLowerCase(),
          word: lineArray[1],
          meaning: lineArray[2] ? lineArray[2] : "",
          context: lineArray[1],
          mode: WordMode.SHORT,
          marker: false
        })
      } else if (lineArray.length === 3 && this.CJK_REGEX.test(lineArray[0])) { // character | pinyin | meaning
        wordModel = new WordModel({
          word: lineArray[0].trim(),
          pinyin: lineArray[1].trim(),
          meaning: lineArray[2].trim(),
          context: lineArray[0].trim(),
          mode: WordMode.SHORT,
          marker: false
        })
      } else { //direct word
        if (lineArray.length > 2) {
          const l0 = lineArray.slice(0, -1).join(" ")
          const l1 = lineArray[lineArray.length - 1]
          lineArray.length = 0;
          lineArray.push(l0, l1)
          warnings.push(`${line}\nmore than 2 words spotted\nConverted to: \n${lineArray.join("  |  ")}`);
        }
        wordModel = new WordModel({
          meaning: lineArray[1] ? lineArray[1] : "",
          word: lineArray[0],
          context: lineArray[0],
          mode: WordMode.SHORT,
          marker: false
        })
      }
      wordModel.sourceLine = line
      words.push(wordModel)
    });
    if (warnings.length > 0) {
      console.warn(warnings.join("\n"))
    }
    return words
  }
}