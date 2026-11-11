import type { HelpTooltip } from '@/composables/useHelpTooltip'

// Top bar help tooltip for multiple choice editing (PageMultipleChoice edit mode, PageAddPage).
export const MULTIPLE_CHOICE_HELP_TOOLTIP: HelpTooltip = {
    title: 'How to write Multiple Choice',
    body: `One question per line (ENTER).
Separate the question and its answers with:
' | ' (one space, one '|', one space)
The FIRST answer is the correct one, add as many as you like:`,
    code: `What color is the sky? | Blue | Green | Red
How many days are in a week? | 7 | 5 | 10
Which animal says "meow"? | Cat | Dog | Cow`,
}
