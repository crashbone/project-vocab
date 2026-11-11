<template>
    <!-- Multiple choice editor shared by PageMultipleChoice (edit mode) and PageAddPage (type=multiple_choice).
         The bottom bar stays page-owned; the view toggle is bound through v-model:rawView. -->
    <div class="page-content-container-1 mc-editor" :class="{ 'mc-editor-raw': rawView }">
        <template v-if="rawView">
            <!-- Checked on click / blur / moving to another line, not on every keystroke,
                 so a line being typed is not flagged yet. -->
            <textarea ref="raw-textarea" v-model="rawText" class="raw-mode"
                      @click="checkNow" @blur="checkNow" @keyup="onRawKeyup" />
            <!-- Error panel below the textarea, above the bottom bar. -->
            <div v-if="errors.length > 0" class="mc-error-panel">
                <!-- One block per error: what is wrong, the line as typed, then the fixed line with Apply. -->
                <div v-for="e in errors.slice(0, MAX_SHOWN_ERRORS)" :key="e.lineNumber" class="mc-error">
                    <div class="mc-error-text">Line {{ e.lineNumber }}: {{ e.reason }}</div>
                    <div class="mc-error-line">{{ e.line }}</div>
                    <div class="mc-error-fix">
                        <span class="mc-error-fix-text">{{ e.fixed }}</span>
                        <div class="small-button" @click="applyFixes([e])">Apply</div>
                    </div>
                </div>
                <div v-if="errors.length > MAX_SHOWN_ERRORS" class="mc-error-more">
                    and {{ errors.length - MAX_SHOWN_ERRORS }} more
                </div>
                <div v-if="errors.length > 1" class="small-button mc-error-apply-all"
                     @click="applyFixes(errors)">Apply all</div>
            </div>
        </template>

        <template v-else>
            <div class="quiz-area">
                <div v-if="current" class="question-block">
                    <EditableCard class="edit-question" :class="{ invalid: isInvalid(current) }" :index="0"
                                  v-model="current.question"
                                  :editing="editingField === -1" @update:editing="setFieldEditing(-1, $event)" />
                    <div class="answers">
                        <!-- As in the text format the first answer is the correct one. The trailing empty card adds a new answer. -->
                        <EditableCard v-for="(_, i) in current.answers" :key="`${index}-${i}`"
                                      :class="{ correct: i === 0 }" :index="i"
                                      v-model="current.answers[i]"
                                      :editing="editingField === i" @update:editing="setFieldEditing(i, $event)" />
                    </div>
                </div>
            </div>
            <div v-if="invalidCount > 0" class="mc-invalid-count">
                {{ invalidCount }} invalid question{{ invalidCount === 1 ? '' : 's' }}
            </div>
            <QuestionNav class="content-nav" :index="index" :total="total" allowNew @go="goToQuestion" />
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'
import { WordManager, type MultipleChoiceQuestion } from '@/wordManagement/wordManager'
import { prependExample } from '@/composables/useHelpTooltip'

const MAX_SHOWN_ERRORS = 3

// v-model: the page text ("question | correct | wrong ..." per line). Read once on mount;
// afterwards the editor only writes it. Parents validate it with WordManager.validateMultipleChoice.
const model = defineModel<string>({ required: true })
const rawView = defineModel<boolean>('rawView', { default: false })
// v-model:index: the shown question (in source order).
const index = defineModel<number>('index', { default: 0 })

const wm = WordManager.instance

// Both views share the same data: switching re-parses / re-formats the raw text.
// In questions the correct answer is always the first one (as in the format).
const questions = ref<MultipleChoiceQuestion[]>([])
const rawText = ref(model.value)
// -1 = question text, i = i-th answer, null = none.
const editingField = ref<number | null>(null)
const current = computed(() => questions.value[index.value])

// An empty (new, not yet written) question and empty answers are not saved / written to raw.
const isEmptyQuestion = (q: MultipleChoiceQuestion) => q.question.trim() === '' && q.answers.every(a => a.trim() === '')
const emptyQuestion = (): MultipleChoiceQuestion => ({ question: '', answers: [''], correctIndex: 0 })
// Unchanged questions keep the user's source line (see wordManagement/sourceLine.ts).
const formatQuestions = () => wm.formatMultipleChoiceForExport(questions.value)

const isInvalid = (q: MultipleChoiceQuestion) => !isEmptyQuestion(q) && wm.multipleChoiceQuestionError(q) !== null
const invalidCount = computed(() => questions.value.filter(isInvalid).length)
// Raw view errors come from the last checked text, not the live one (see checkNow).
const checkedText = ref(rawText.value)
const errors = computed(() => wm.validateMultipleChoice(checkedText.value))

// The trailing empty (unwritten) question is not counted: "N+1 / N"; once written "N+1 / N+1".
const total = computed(() => {
    const qs = questions.value
    return qs.length > 0 && isEmptyQuestion(qs[qs.length - 1]) ? qs.length - 1 : qs.length
})

const setQuestions = (qs: MultipleChoiceQuestion[]) => {
    questions.value = qs.length > 0 ? qs : [emptyQuestion()]
    index.value = Math.max(0, Math.min(index.value, questions.value.length - 1))
}
setQuestions(wm.setupMultipleChoice(model.value, true))

// The shown question always ends with one empty answer card; typing into it adds a new one.
// When editing stops, empty answers in between are removed.
watch([current, editingField], () => {
    const q = current.value
    if (!q) return
    if (editingField.value === null) {
        const filled = q.answers.filter(a => a !== '')
        if (filled.length + 1 !== q.answers.length || q.answers[q.answers.length - 1] !== '') q.answers = [...filled, '']
    } else if (q.answers[q.answers.length - 1] !== '') {
        q.answers.push('')
    }
}, { deep: true })

// Keep the parent's text in sync with whichever view is active.
watch([questions, rawText, rawView], () => {
    model.value = (rawView.value ? rawText.value : formatQuestions()).replace(/\n+$/, '')
}, { deep: true, immediate: true })

// Forward from the last question opens an empty new one. An unwritten new question is dropped when left.
const goToQuestion = (i: number) => {
    if (i < 0 || i > total.value) return
    editingField.value = null
    const qs = questions.value
    const last = qs.length - 1
    if (index.value === last && i !== last && qs.length > 1 && isEmptyQuestion(qs[last])) qs.pop()
    if (i >= qs.length) qs.push(emptyQuestion())
    index.value = i
}

const setFieldEditing = (field: number, on: boolean) => {
    if (on) editingField.value = field
    else if (editingField.value === field) editingField.value = null
}

// The parent flips rawView (bottom bar); the data is converted for the newly active view.
watch(rawView, (raw) => {
    editingField.value = null
    if (raw) checkedText.value = rawText.value = formatQuestions()
    else setQuestions(wm.setupMultipleChoice(rawText.value, true))
})

// Raw view: check on click / blur, or when the caret moves to another line.
const rawTextarea = useTemplateRef<HTMLTextAreaElement>('raw-textarea')
const caretLine = () => {
    const el = rawTextarea.value
    return el ? el.value.slice(0, el.selectionStart).split('\n').length : 0
}
let lastCaretLine = 0
const checkNow = () => {
    checkedText.value = rawText.value
    lastCaretLine = caretLine()
}
const onRawKeyup = () => {
    // First key after focusing via keyboard: just remember the line, do not check yet.
    if (lastCaretLine === 0) lastCaretLine = caretLine()
    else if (caretLine() !== lastCaretLine) checkNow()
}

// Replaces each listed line with its fixed version (only if the line is unchanged since the check).
const applyFixes = (list: { lineNumber: number, line: string, fixed: string }[]) => {
    const lines = rawText.value.split('\n')
    list.forEach(e => {
        if (lines[e.lineNumber - 1]?.trim() === e.line) lines[e.lineNumber - 1] = e.fixed
    })
    rawText.value = lines.join('\n')
    checkedText.value = rawText.value
}

// Puts text at the start of the page text (help tooltip "Insert example"), in either view.
const prependText = (text: string) => {
    editingField.value = null
    checkedText.value = rawText.value = prependExample(rawView.value ? rawText.value : formatQuestions(), text)
    if (!rawView.value) {
        index.value = 0
        setQuestions(wm.setupMultipleChoice(rawText.value, true))
    }
}
// Trash: Standard View removes the shown question (an empty one stays if it was the last);
// Raw View removes the line the cursor is on.
const deleteCurrentQuestion = () => {
    editingField.value = null
    if (rawView.value) {
        const lines = rawText.value.split('\n')
        lines.splice(caretLine() - 1, 1)
        checkedText.value = rawText.value = lines.join('\n')
        return
    }
    questions.value.splice(index.value, 1)
    setQuestions(questions.value)
}
defineExpose({ prependText, deleteCurrentQuestion })
</script>

<style src="./MultipleChoiceEditor.scss" lang="scss"></style>
