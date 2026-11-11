<template>
    <div v-if="!page"></div>
    <div v-else class="app-frame page words multiple-choice mc-quiz" :class="{ 'edit-mode-active': editMode, 'two-row-bar': !editMode && !inGame }">
        <!-- TOP BAR: the title changes only in edit mode; edit can be entered only outside the game (idle / over). -->
        <PageWithWordsTopBar
                             :title="editMode ? editTitle : title"
                             :titleAdjustable="editMode"
                             :backDisabled="inGame || editMode"
                             @update:title="editTitle = $event">
            <!-- Edit mode: trash (deletes the shown question / the cursor line in Raw View), rightmost;
                 in Raw View the help icon follows it. Otherwise: pencil (outside play) + profile. -->
            <template v-if="editMode" #right>
                <!-- The trash sits in a slot as wide as the profile / help icon (ICON_SLOT_SIZE), centered in it,
                     so in Standard View it is centered exactly where the profile icon is. -->
                <div class="pointer" :style="{ width: `${ICON_SLOT_SIZE}px`, display: 'flex', justifyContent: 'center', alignSelf: 'center' }"
                     @click="confirmDeleteQuestion">
                    <SvgX url="/main/src/frontend/assets/svg/trash.svg" :width="22" :height="22" />
                </div>
                <SvgX v-if="editRaw" v-tooltip="mcHelpTooltip" class="pointer" url="/main/src/frontend/assets/svg/question.svg" :width="ICON_SLOT_SIZE" :height="ICON_SLOT_SIZE" />
            </template>
            <template v-else #right>
                <SvgX v-if="!inGame || gameState === 'paused'" class="pointer" url="/main/src/frontend/assets/svg/pencil.svg"
                      :width="22" :height="22" @click="enterEditMode" />
                <ProfileIcon />
            </template>
        </PageWithWordsTopBar>

        <!-- CONTENT: Edit mode (Standard / Raw view, shared with PageAddPage) -->
        <MultipleChoiceEditor v-if="editMode" ref="mcEditor" v-model="editWords" v-model:rawView="editRaw" v-model:index="editIndex" />

        <!-- CONTENT -->
        <div v-else class="page-content-container-1">
            <div class="quiz-area">
                <template v-if="current">
                    <div v-if="gameState === 'over'" class="result-strip" :class="endReason">
                        {{ resultText }}
                    </div>
                    <Transition name="mc-question" mode="out-in">
                        <div class="question-block" :key="questionIndex">
                            <div class="question-row">
                                <!-- Remaining time: the ring is full at question start, empty when time runs out (linear). -->
                                <!-- prototype.html #6 (thick): conic-gradient ring, inner part masked out -->
                                <div class="mc-timer">
                                    <div class="mc-timer-ring" :style="{ '--p': (1 - timerProgress) * 100 }"></div>
                                    <div class="mc-timer-text">{{ remainingText }}</div>
                                </div>
                                <div class="question">{{ current.question }}</div>
                            </div>
                            <div class="answers">
                                <ButtonX v-for="(answer, i) in current.answers" :key="`${questionIndex}-${i}`"
                                         class="size80px"
                                         :class="{
                                             correct: showCorrect && i === current.correctIndex,
                                             wrong: showPicked && i === pickedIndex && i !== current.correctIndex,
                                             picked: showPicked && i === pickedIndex,
                                         }"
                                         :index="i"
                                         :shining_border_animation="false"
                                         @click="onAnswerClick(i)">
                                    <div class="button-content2">
                                        <div class="text">{{ answer }}</div>
                                    </div>
                                </ButtonX>
                            </div>
                        </div>
                    </Transition>
                    <div v-if="gameState === 'over'" class="play-again pointer" @click="startGame">
                        <div class="play-triangle"></div>
                        Play again
                    </div>
                </template>
                <div v-else-if="!hasQuestions" class="question">This page has no questions.</div>

            </div>
            <!-- Navigation in the same place as in edit (below the question); dimmed in game, active when paused. -->
            <QuestionNav v-if="inGame" class="content-nav" :index="questionIndex" :total="questions.length"
                         :disabled="gameState !== 'paused'" @go="goToQuestion" />

            <!-- First / last question time, always open outside the game. With preset difficulties it shows that difficulty's values
                 but is locked (so the change is visible); editable only in Custom. -->
            <div class="custom-panel" :class="{ open: !inGame, locked: !isCustom }">
                <div class="custom-panel-inner">
                    <div class="custom-row">
                        <span class="custom-label">First</span>
                        <input type="range" min="0" :max="CUSTOM_SLIDER_MAX" step="0.25"
                               :disabled="!isCustom" :value="Math.min(Number(shownDuration.first) || 0, CUSTOM_SLIDER_MAX)"
                               @input="onCustomSlider('first', ($event.target as HTMLInputElement).value)" />
                        <input type="number" step="any" class="custom-number" :class="{ invalid: customInvalid }"
                               :disabled="!isCustom" :value="shownDuration.first"
                               @input="customFirstInput = ($event.target as HTMLInputElement).value; applyCustomInputs()" />
                    </div>
                    <div class="custom-row">
                        <span class="custom-label">Last</span>
                        <input type="range" min="0" :max="CUSTOM_SLIDER_MAX" step="0.25"
                               :disabled="!isCustom" :value="Math.min(Number(shownDuration.last) || 0, CUSTOM_SLIDER_MAX)"
                               @input="onCustomSlider('last', ($event.target as HTMLInputElement).value)" />
                        <input type="number" step="any" class="custom-number" :class="{ invalid: customInvalid }"
                               :disabled="!isCustom" :value="shownDuration.last"
                               @input="customLastInput = ($event.target as HTMLInputElement).value; applyCustomInputs()" />
                    </div>
                </div>
            </div>
        </div>

        <!-- BOTTOM BAR: PageWords bar pattern (pill + icon on top / label below + selected overlay). -->
        <!-- Outside the game: difficulty on top, Export / Shuffle / Play below. In game: Return on the left, Pause/Resume on the right. -->
        <div v-if="!editMode" class="bottom-bar edit-bottom-bar game-bottom-bar" :class="{ idle: !inGame }">
            <template v-if="!inGame">
                <BottomBarButton :items="DIFFICULTIES.map(d => ({
                    label: DIFFICULTY_NAMES[d], active: difficulty === d, click: () => setDifficulty(d),
                }))" />
                <!-- Same pill as the PageWords bar: Export left, Shuffle middle, Play right. -->
                <BottomBarButton class="spread" :items="[
                    { icon: 'export', label: 'Export', click: exportQuestions },
                    { icon: 'shuffle', label: 'Shuffle', iconSize: 20, active: random, click: toggleRandom },
                    ...(hasQuestions ? [{ icon: 'play', label: 'Play', click: startGame }] : []),
                ]" />
            </template>
            <!-- Same 3-slot pill as outside the game: Return under Export, Pause/Resume under Play.
                 Return only while paused; the middle slot is an invisible placeholder. -->
            <BottomBarButton v-else class="spread" :items="[
                { icon: 'skip-start', label: 'Return', hidden: gameState !== 'paused', click: confirmReturnToIdle },
                { icon: 'shuffle', label: 'Shuffle', hidden: true },
                {
                    icon: gameState === 'paused' ? 'play' : 'pause',
                    label: gameState === 'paused' ? 'Resume' : 'Pause',
                    disabled: gameState === 'feedback' || (gameState === 'paused' && currentAnswered),
                    click: () => gameState === 'paused' ? resumeGame() : pauseGame(),
                },
            ]" />
        </div>

        <!-- BOTTOM BAR: Edit mode -->
        <div v-if="editMode" class="bottom-bar edit-bottom-bar">
            <BottomBarButton icon="x" :iconSize="15" label="Cancel" @click="exitEditMode" />
            <BottomBarButton :items="[
                { icon: 'export', label: 'Standard View', active: !editRaw, click: () => editRaw = false },
                { icon: 'export', label: 'Raw View', active: editRaw, click: () => editRaw = true },
            ]" />
            <BottomBarButton icon="export" label="Save" :class="{ disabled: editInvalid }" @click="onEditSaveClick" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, useTemplateRef, onMounted, onBeforeUnmount } from "vue";
import { useAppStore } from '@/stores/appStore'
import { PageModel } from "@/wordManagement/PageModel";
import { showExportPopup } from "@/junk/exportPopup";
import { WordManager, type MultipleChoiceQuestion } from "@/wordManagement/wordManager";
import { sendUpdatePageRequest } from "@/wordManagement/updatePageRequest";
import { showConfirmationPopup, closeConfirmationPopup } from '@/NonPageComponents/ConfirmationPopup/confirmationPopup'
import {
    Difficulty, DIFFICULTY_NAMES, DIFFICULTY_LOCAL_STORAGE_KEY,
    getQuestionDuration, loadDifficulty, DIFFICULTY_DURATION_RANGES,
    CUSTOM_SLIDER_MAX, isValidCustomDuration, loadCustomDuration, saveCustomDuration,
    loadRandom, saveRandom, ANSWER_FEEDBACK_MS,
} from "@/wordManagement/Difficulty";
import { savePageState, loadPageState, clearPageState, PAGE_STATE_KEYS } from "@/junk/pageStateService";
import { TimeSpentHandler } from "@/junk/TimeSpentHandler";
import { addOrUpdate } from "@/junk/localStorageHandler";
import { toDashboard } from "@/junk/router";
import { shuffle } from "@/junk/util/shuffle";
import PageWithWordsTopBar from "@/NonPageComponents/PageWithWordsTopBar/PageWithWordsTopBar.vue";
import MultipleChoiceEditor from "@/NonPageComponents/MultipleChoiceEditor/MultipleChoiceEditor.vue";
import { MULTIPLE_CHOICE_HELP_TOOLTIP } from "@/NonPageComponents/MultipleChoiceEditor/multipleChoiceHelp";
import { useHelpTooltip } from "@/composables/useHelpTooltip";

const DIFFICULTIES = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD, Difficulty.CUSTOM]

const appStore = useAppStore()
// Top bar right icons: the help icon's size, same as the profile icon (Page.scss .profile-icon).
const ICON_SLOT_SIZE = 31
const props = defineProps({
    pageId: String, // it has to be string, because url param
})

const page = computed((): PageModel | undefined => {
    if (!props.pageId || !appStore.dashboardModel) {
        return undefined;
    }
    const pageId = Number.parseInt(props.pageId) || 0;
    return appStore.dashboardModel.pageModelMap![pageId]
})


/* ==================
 * === DIFFICULTY ===
 * ================== */

const difficulty = ref(loadDifficulty())

// The first question time shown before start is refreshed from the current setting.
const refreshIdleDuration = () => {
    if (gameState.value === 'idle') {
        questionDuration.value = getQuestionDuration(0, questions.value.length, difficulty.value) * 1000
    }
}

// The picker is visible only outside the game; a new difficulty takes effect on the next Start.
const setDifficulty = (d: Difficulty) => {
    difficulty.value = d
    refreshIdleDuration()
    try {
        addOrUpdate(DIFFICULTY_LOCAL_STORAGE_KEY, String(d))
    } catch { /* if localStorage is unavailable it applies to this session only */ }
}

// CUSTOM: the input value is authoritative; the slider shows at most CUSTOM_SLIDER_MAX.
const initialCustom = loadCustomDuration()
const customFirstInput = ref<string | number>(initialCustom.first)
const customLastInput = ref<string | number>(initialCustom.last)
const customInvalid = ref(false)

// Shown in the panel: the user's input in Custom, the difficulty's range for presets (first = max, last = min).
const isCustom = computed(() => difficulty.value === Difficulty.CUSTOM)
const shownDuration = computed(() => {
    if (difficulty.value === Difficulty.CUSTOM) return { first: customFirstInput.value, last: customLastInput.value }
    const r = DIFFICULTY_DURATION_RANGES[difficulty.value]
    return { first: r.max, last: r.min }
})

// Invalid input is not saved, the last valid value stays; the input is shown in red.
const applyCustomInputs = () => {
    const c = { first: Number(customFirstInput.value), last: Number(customLastInput.value) }
    customInvalid.value = String(customFirstInput.value) === '' || String(customLastInput.value) === ''
        || !isValidCustomDuration(c)
    if (customInvalid.value) return
    saveCustomDuration(c)
    refreshIdleDuration()
}

const onCustomSlider = (which: 'first' | 'last', value: string) => {
    if (which === 'first') customFirstInput.value = Number(value)
    else customLastInput.value = Number(value)
    applyCustomInputs()
}


/* ==============
 * === RANDOM ===
 * ============== */

const random = ref(loadRandom())

const toggleRandom = () => {
    if (inGame.value) return
    random.value = !random.value
    saveRandom(random.value)
    prepareGame()
}


/* ============
 * === GAME ===
 * ============ */

type GameState = 'idle' | 'playing' | 'paused' | 'feedback' | 'over'
type EndReason = 'wrong' | 'timeout' | 'done'

const questions = ref<MultipleChoiceQuestion[]>([])
const questionIndex = ref(0)
// idle: page opened, Start (▶) not pressed. The quiz does not start by itself.
// feedback: answered, the correct / wrong animation is showing (timer stopped, clicks locked).
const gameState = ref<GameState>('idle')
// Round in progress: difficulty, random and edit are disabled.
const inGame = computed(() =>
    gameState.value === 'playing' || gameState.value === 'paused' || gameState.value === 'feedback')
const pickedIndex = ref(-1)
const endReason = ref<EndReason>('done')
// Per question: answered correctly or not, and time spent (ms; 0 = not started, full time).
const answered = ref<boolean[]>([])
const elapsedPerQuestion = ref<number[]>([])
let feedbackTimeout: number | undefined

const answeredCount = computed(() => answered.value.filter(Boolean).length)

const resultText = computed(() => {
    const total = questions.value.length
    if (endReason.value === 'done') return `✓ ${total} / ${total} correct`
    const label = endReason.value === 'wrong' ? '✗ Wrong' : "⏱ Time's up"
    return `${label} · ${answeredCount.value} / ${total} correct`
})

const current = computed(() => questions.value[questionIndex.value])
const currentAnswered = computed(() => answered.value[questionIndex.value] === true)
const hasQuestions = computed(() => (page.value?.questions.length ?? 0) > 0)

// Correct answer: green in feedback / over and when revisiting an answered question (read-only).
const showCorrect = computed(() =>
    gameState.value === 'over' || gameState.value === 'feedback'
    || (gameState.value === 'paused' && currentAnswered.value))
const showPicked = computed(() => gameState.value === 'over' || gameState.value === 'feedback')

// Time limit of the active question and elapsed time (ms).
const questionDuration = ref(0)
const elapsed = ref(0)
let questionStartedAt = 0
let rafId: number | undefined

const timerProgress = computed(() => {
    if (questionDuration.value <= 0) return 0
    return Math.min(1, elapsed.value / questionDuration.value)
})
const remainingText = computed(() => {
    // Whole seconds; decimals in the last 3 s (prototype.html #2).
    const left = Math.max(0, questionDuration.value - elapsed.value) / 1000
    return left >= 3 ? String(Math.ceil(left)) : left.toFixed(1)
})

// Answers are always shuffled (in the data the correct one is always first); question order only if Random is on.
const buildShuffledQuestions = (source: MultipleChoiceQuestion[]): MultipleChoiceQuestion[] => {
    const built = source.map(q => {
        const answers = shuffle(q.answers.map((text, i) => ({ text, correct: i === q.correctIndex })))
        return {
            question: q.question,
            answers: answers.map(a => a.text),
            correctIndex: answers.findIndex(a => a.correct),
        }
    })
    return random.value ? shuffle(built) : built
}

const clearFeedbackTimeout = () => {
    if (feedbackTimeout !== undefined) {
        clearTimeout(feedbackTimeout)
        feedbackTimeout = undefined
    }
}

// A new round is prepared and the first question shows faded behind ▶, timer not filled.
const prepareGame = () => {
    if (!page.value) return
    stopTimer()
    clearFeedbackTimeout()
    questions.value = buildShuffledQuestions(page.value.questions)
    answered.value = questions.value.map(() => false)
    elapsedPerQuestion.value = questions.value.map(() => 0)
    questionIndex.value = 0
    pickedIndex.value = -1
    questionDuration.value = getQuestionDuration(0, questions.value.length, difficulty.value) * 1000
    elapsed.value = 0
    gameState.value = 'idle'
}

const startGame = () => {
    // If the game is over, a new round; in idle the already prepared round is used.
    if (gameState.value === 'over') prepareGame()
    if (questions.value.length === 0) return
    gameState.value = 'playing'
    startQuestion(0)
}

// A question resumes where it left off if time was already spent on it (skipped and revisited).
const showQuestion = (i: number) => {
    questionIndex.value = i
    pickedIndex.value = -1
    questionDuration.value = getQuestionDuration(i, questions.value.length, difficulty.value) * 1000
    elapsed.value = elapsedPerQuestion.value[i] ?? 0
}

const startQuestion = (i: number) => {
    showQuestion(i)
    questionStartedAt = performance.now() - elapsed.value
    stopTimer()
    rafId = requestAnimationFrame(tick)
}

const tick = (now: number) => {
    elapsed.value = now - questionStartedAt
    if (elapsed.value >= questionDuration.value) {
        elapsed.value = questionDuration.value
        showFeedback(-1)
        return
    }
    rafId = requestAnimationFrame(tick)
}

const stopTimer = () => {
    if (rafId !== undefined) {
        cancelAnimationFrame(rafId)
        rafId = undefined
    }
}

const endGame = (reason: EndReason) => {
    stopTimer()
    clearFeedbackTimeout()
    endReason.value = reason
    gameState.value = 'over'
}

// Next unanswered question; at the end wraps around if skipped questions remain. Otherwise -1.
const nextUnanswered = (from: number): number => {
    const n = questions.value.length
    for (let k = 1; k <= n; k++) {
        const i = (from + k) % n
        if (!answered.value[i]) return i
    }
    return -1
}

// Elapsed time is kept; on resume the start time is moved back by that amount.
const pauseGame = () => {
    if (gameState.value !== 'playing') return
    stopTimer()
    elapsedPerQuestion.value[questionIndex.value] = elapsed.value
    gameState.value = 'paused'
}

const resumeGame = () => {
    if (gameState.value !== 'paused' || currentAnswered.value) return
    questionStartedAt = performance.now() - elapsed.value
    gameState.value = 'playing'
    rafId = requestAnimationFrame(tick)
}

// Only while paused; navigating stays paused.
const goToQuestion = (i: number) => {
    if (gameState.value !== 'paused' || i < 0 || i >= questions.value.length) return
    elapsedPerQuestion.value[questionIndex.value] = elapsed.value
    showQuestion(i)
}

// While paused, ends the round and returns to difficulty selection (idle); the saved round is deleted too.
// Edit mode trash (Standard View): deletes the shown question after confirmation.
const confirmDeleteQuestion = () => {
    showConfirmationPopup({
        title: 'Delete this question?',
        buttons: [
            { name: 'Cancel', click: closeConfirmationPopup },
            { name: 'Delete', click: () => { closeConfirmationPopup(); mcEditor.value?.deleteCurrentQuestion() } },
        ],
    })
}

const confirmReturnToIdle = () => {
    if (gameState.value !== 'paused') return
    showConfirmationPopup({
        title: 'End this round?',
        buttons: [
            { name: 'Cancel', click: closeConfirmationPopup },
            {
                name: 'End',
                click: () => {
                    closeConfirmationPopup()
                    prepareGame()
                    clearPageState(gameStateKey(), 'session')
                },
            },
        ],
    })
}

// picked = -1: time ran out. The timer stops, the result is shown for ANSWER_FEEDBACK_MS.
const showFeedback = (picked: number) => {
    if (!current.value) return
    stopTimer()
    pickedIndex.value = picked
    gameState.value = 'feedback'
    const correct = picked === current.value.correctIndex
    feedbackTimeout = window.setTimeout(() => {
        feedbackTimeout = undefined
        if (!correct) {
            endGame(picked === -1 ? 'timeout' : 'wrong')
            return
        }
        answered.value[questionIndex.value] = true
        const next = nextUnanswered(questionIndex.value)
        if (next === -1) {
            endGame('done')
            return
        }
        gameState.value = 'playing'
        startQuestion(next)
    }, ANSWER_FEEDBACK_MS)
}

const onAnswerClick = (i: number) => {
    if (gameState.value !== 'playing' || !current.value) return
    showFeedback(i)
}


/* =======================================
 * === GAME STATE (only on reload) ===
 * ======================================= */

interface SavedGameState {
    questions: MultipleChoiceQuestion[]
    questionIndex: number
    answered: boolean[]
    elapsedPerQuestion: number[]
    gameState: GameState
    endReason: EndReason
    pickedIndex: number
}

const gameStateKey = () => PAGE_STATE_KEYS.multipleChoice(props.pageId ?? '')

// State saved while playing / in feedback is paused: after a reload the game opens paused.
const saveGameState = () => {
    if (gameState.value === 'idle') {
        clearPageState(gameStateKey(), 'session')
        return
    }
    const elapsedCopy = [...elapsedPerQuestion.value]
    if (gameState.value !== 'over') elapsedCopy[questionIndex.value] = elapsed.value
    const state: SavedGameState = {
        questions: questions.value,
        questionIndex: questionIndex.value,
        answered: answered.value,
        elapsedPerQuestion: elapsedCopy,
        gameState: gameState.value === 'over' ? 'over' : 'paused',
        endReason: endReason.value,
        pickedIndex: gameState.value === 'over' ? pickedIndex.value : -1,
    }
    savePageState(gameStateKey(), state, 'session')
}

// The saved round is restored if it matches this page's current question count.
const restoreGameState = (): boolean => {
    const s = loadPageState<SavedGameState>(gameStateKey(), 'session')
    if (!s || !page.value || s.questions?.length !== page.value.questions.length) return false
    questions.value = s.questions
    answered.value = s.answered
    elapsedPerQuestion.value = s.elapsedPerQuestion
    showQuestion(s.questionIndex)
    pickedIndex.value = s.pickedIndex
    endReason.value = s.endReason
    gameState.value = s.gameState
    return true
}

watch([questions, questionIndex, answered, gameState, endReason], saveGameState, { deep: true })

const title = ref('')

const exportQuestions = () => {
    if (!page.value) return
    showExportPopup(`${page.value.questions.length} questions`,
        WordManager.instance.formatMultipleChoiceForExport(page.value.questions), title.value || 'questions')
}

// After saving, loadPages brings a new PageModel: title and round are refreshed.
// Saving is impossible during a game, so a round in play is never disrupted.
watch(page, (newPage, oldPage) => {
    if (!newPage || newPage === oldPage) return
    title.value = newPage.name
    if (!oldPage && restoreGameState()) return
    if (!inGame.value) prepareGame()
}, { immediate: true })


/* ====================
 * === TITLE / EDIT ===
 * ==================== */

const editMode = ref(false)
const editTitle = ref('')
const editSaving = ref(false)
// Editor state lives in MultipleChoiceEditor; the page keeps the text, the view toggle and the shown question.
const editWords = ref('')
const mcEditor = useTemplateRef<InstanceType<typeof MultipleChoiceEditor>>('mcEditor')
const mcHelpTooltip = useHelpTooltip(MULTIPLE_CHOICE_HELP_TOOLTIP, editWords,
    (example) => mcEditor.value?.prependText(example))
const editRaw = ref(false)
const editIndex = ref(0)
// Save is blocked while any line is invalid.
const editInvalid = computed(() => WordManager.instance.validateMultipleChoice(editWords.value).length > 0)

const showError = (message: string) => {
    showConfirmationPopup({
        title: message,
        buttons: [{ name: 'OK', click: closeConfirmationPopup }],
    })
}

const enterEditMode = () => {
    if (!page.value || (inGame.value && gameState.value !== 'paused')) return
    editTitle.value = page.value.name
    editRaw.value = false
    editWords.value = WordManager.instance.formatMultipleChoiceForExport(page.value.questions)
    // The (shuffled) quiz question is found by its text in source order.
    const i = page.value.questions.findIndex(q => q.question === current.value?.question)
    editIndex.value = i >= 0 ? i : 0
    editMode.value = true
}

const exitEditMode = () => {
    editMode.value = false
}

const onEditSaveClick = async () => {
    if (editSaving.value || !page.value) return

    if (editTitle.value.trim() === '') {
        showError('Title cannot be empty.')
        return
    }

    if (editInvalid.value) return
    const words = editWords.value
    const parsed = WordManager.instance.setupMultipleChoice(words)
    if (parsed.length === 0) {
        showError('Add at least one question with two answers.')
        return
    }

    editSaving.value = true
    const res = await sendUpdatePageRequest({
        id: page.value.id,
        name: editTitle.value,
        description: page.value.description,
        words,
    })
    editSaving.value = false

    if (!res.success) {
        // Edit mode stays open, so the user does not lose their input.
        showError(`Could not save: ${res.error ?? 'unknown error'}`)
        return
    }

    // After saving, continue from the same question.
    const oldText = parsed[Math.min(editIndex.value, parsed.length - 1)].question
    const oldIndex = questionIndex.value

    await appStore.loadPages()
    await nextTick() // let the page watcher run (prepareGame in idle / over)
    if (gameState.value === 'paused' && page.value) {
        // A paused round is rebuilt with the new questions; answered state / time spent carry over by question text.
        const oldQs = questions.value
        const oldAnswered = answered.value
        const oldElapsed = elapsedPerQuestion.value
        questions.value = buildShuffledQuestions(page.value.questions)
        const oldPos = questions.value.map(q => oldQs.findIndex(o => o.question === q.question))
        answered.value = oldPos.map(p => oldAnswered[p] ?? false)
        elapsedPerQuestion.value = oldPos.map(p => oldElapsed[p] ?? 0)
    }
    const newQs = questions.value
    const i = newQs.findIndex(q => q.question === oldText)
    showQuestion(Math.max(0, i >= 0 ? i : Math.min(oldIndex, newQs.length - 1)))
    exitEditMode()
}



/* =================
 * === LIFECYCLE ===
 * ================= */

onMounted(() => {
    setTimeout(() => {
        if (!appStore.dashboardModel) {
            toDashboard();
            return;
        }
    }, 5000);
    TimeSpentHandler.instance.startRecording(`page${props.pageId}`)
    // Unmount does not run on reload; time spent while playing is saved here.
    window.addEventListener('pagehide', saveGameState)
})

onBeforeUnmount(() => {
    stopTimer()
    clearFeedbackTimeout()
    window.removeEventListener('pagehide', saveGameState)
    // Leaving the page within the app clears the round; it starts over on the next visit.
    clearPageState(gameStateKey(), 'session')
    TimeSpentHandler.instance.stopRecording(`page${props.pageId}`)
})
</script>

<style src="./PageMultipleChoice.scss" lang="scss"></style>
