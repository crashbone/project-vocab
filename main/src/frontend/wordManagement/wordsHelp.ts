import type { HelpTooltip } from '@/composables/useHelpTooltip'

// Top bar help tooltip for the Words raw view (PageWords edit mode, PageAddPage).
export const WORDS_RAW_HELP_TOOLTIP: HelpTooltip = {
    title: 'How to use Raw View',
    body: `Separate two sides of the flash card with:
'    ' (4 spaces) or
' | ' (one space, one '|', one space)

Separate new words with new line (ENTER):`,
    code: `der Mann | Man
die Frau | Woman
der Apfel | Apple
das Auto | Car
das Buch | Book
das Kind | Child`,
}
