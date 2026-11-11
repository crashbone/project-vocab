// Standard View items (flash card rows, multiple choice questions) parsed from a raw line keep
// that line verbatim plus the values it parsed to, so Standard -> Raw can give the user's own
// text back (delimiter and spacing kept) for items that were not changed.
export type SourceLine = { line: string, values: string }

export type WithSource = { source?: SourceLine }

const key = (values: string[]) => JSON.stringify(values)

export const sourceLine = (line: string, values: string[]): SourceLine => ({ line, values: key(values) })

// One line per item: unchanged item -> its source line, changed / new item -> format(values).
// Items whose values are all empty are not written.
export function itemsToRawText<T extends WithSource>(items: T[], valuesOf: (item: T) => string[],
  format: (values: string[]) => string): string {
  return items.map(item => {
    const values = valuesOf(item)
    if (values.every(v => v === '')) return ''
    return item.source && item.source.values === key(values) ? item.source.line : format(values)
  }).filter(line => line !== '').join('\n')
}
