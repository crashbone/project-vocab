import { WordModel } from '@/wordManagement/WordModel'
import { WordMode } from '@/wordManagement/WordMode'
import { splitByDelimiters } from '@/junk/util/splitByDelimiters'


export class WordManager {
  static _instance: WordManager | null = null;
  delimiters = ["\t", "    ", " | "]; // ["\t", "::", "//", "--", "__"],
  ARTIKELS = ["der", "die", "das"];

  private constructor() { }

  static get instance(): WordManager {
    if (!WordManager._instance) {
      WordManager._instance = new WordManager();
      window.wordManager = WordManager._instance
    }
    return WordManager._instance;
  }

  // setupWords'un tersi: modelleri tekrar ham metne cevirir (' | ' ayraci, satirlar '\n').
  formatWordsForExport(words: WordModel[]): string {
    return words.map(w => {
      const left = w.hasArtikel ? `${w.artikel} ${w.word}` : w.word
      return `${left} | ${w.meaning}`
    }).join('\n')
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
      words.push(wordModel)
    });
    if (warnings.length > 0) {
      console.warn(warnings.join("\n"))
    }
    return words
  }
}