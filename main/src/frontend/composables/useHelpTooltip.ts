import { computed, ref, type Ref } from 'vue'
import type { TooltipOptions } from '@/directives/tooltip'

// A help tooltip whose code block is the example that "Insert example" inserts.
export interface HelpTooltip {
    title: string
    body: string
    code: string
}

export const INSERT_EXAMPLE_LABEL = 'Apply'
export const INSERT_EXAMPLE_HINT = 'Press Apply to add this example to the top of your text.'

/** Puts `example` at the very start of `text` (on its own line if there is text). */
export function prependExample(text: string, example: string): string {
    return text === '' ? example : `${example}\n${text}`
}

/**
 * Tooltip options for a help tooltip with an "Insert example" action.
 * The action is enabled if it was never used on this screen or `text` is empty;
 * `insert` receives the example and must put it at the start of the text.
 */
export function useHelpTooltip(help: HelpTooltip, text: Ref<string>, insert: (example: string) => void) {
    const used = ref(false)
    return computed<TooltipOptions>(() => ({
        ...help,
        action: {
            label: INSERT_EXAMPLE_LABEL,
            hint: INSERT_EXAMPLE_HINT,
            disabled: used.value && text.value.trim() !== '',
            onClick: () => {
                used.value = true
                insert(help.code)
            },
        },
    }))
}
