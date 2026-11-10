<template>
    <div v-if="!page"></div>
    <div v-else class="app-frame page words multiple-choice" :class="{ 'edit-mode-active': editMode, 'two-row-bar': !editMode && !inGame }">
        <!-- TOP BAR: baslik sadece edit modunda degisir; edit'e sadece oyun disinda (idle / over) girilir. -->
        <PageWithWordsTopBar
                             :title="editMode ? editTitle : title"
                             :titleAdjustable="editMode"
                             :backDisabled="inGame || editMode"
                             @update:title="editTitle = $event">
            <template v-if="editMode" #right>
                <SvgX v-tooltip="{
                    title: 'How to write Multiple Choice',
                    body: `One question per line (ENTER).
Separate the question and its answers with:
' | ' (one space, one '|', one space)
The FIRST answer is the correct one, add as many as you like:
Capital of France? | Paris | Berlin | Rome
2 + 2 = ? | 4 | 3 | 5 | 22`
                }" class="pointer" url="/main/src/frontend/assets/svg/question.svg" :width="31" :height="31" />
            </template>
            <template v-else-if="!inGame || gameState === 'paused'" #right>
                <SvgX class="pointer" url="/main/src/frontend/assets/svg/pencil.svg" :width="22" :height="22"
                      @click="enterEditMode" />
            </template>
        </PageWithWordsTopBar>

        <!-- CONTENT: Edit mode - Raw (AddPage'deki gibi) -->
        <div v-if="editMode && editRaw" class="page-content-container-1">
            <textarea v-model="editRawModeString" class="raw-mode" />
        </div>

        <!-- CONTENT: Edit mode - tek soru, quiz gorunumuyle; her alan tiklaninca duzenlenir (PageWords gibi). -->
        <div v-else-if="editMode" class="page-content-container-1">
            <div class="quiz-area">
                <div v-if="editCurrent" class="question-block">
                    <EditableCard class="edit-question" :index="0"
                                  v-model="editCurrent.question"
                                  :editing="editingField === -1" @update:editing="setFieldEditing(-1, $event)" />
                    <div class="answers">
                        <!-- Formattaki gibi ilk sik dogru cevaptir. Sondaki bos kart yeni sik ekler. -->
                        <EditableCard v-for="(_, i) in editCurrent.answers" :key="`${editIndex}-${i}`"
                                      :class="{ correct: i === 0 }" :index="i"
                                      v-model="editCurrent.answers[i]"
                                      :editing="editingField === i" @update:editing="setFieldEditing(i, $event)" />
                    </div>
                </div>
                <div v-else class="question">This page has no questions.</div>
            </div>
            <QuestionNav class="content-nav" :index="editIndex" :total="editTotal" allowNew @go="goToEditQuestion" />
        </div>

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
                                <!-- Kalan sure: halka soru basinda tam dolu, sure bitince bos (lineer). -->
                                <!-- prototype.html #6 (kalin): conic-gradient halka, ic kisim maskeyle bos -->
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
            <!-- Gezinme edit'tekiyle ayni yerde (sorunun altinda); oyunda sonuk, pause'da aktif. -->
            <QuestionNav v-if="inGame" class="content-nav" :index="questionIndex" :total="questions.length"
                         :disabled="gameState !== 'paused'" @go="goToQuestion" />

            <!-- Ilk / son soru suresi, oyun disinda hep acik. Hazir zorluklarda o zorlugun degerlerini
                 gosterir ama kilitlidir (degistigi gorulsun); sadece Custom'da duzenlenir. -->
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

        <!-- BOTTOM BAR: PageWords bar kalibi (pill + ikon ustte / etiket altta + secili overlay). -->
        <!-- Oyun disi: ustte zorluk, altta Random + Play. Oyunda: solda Return, sagda Pause/Resume. -->
        <div v-if="!editMode" class="bottom-bar edit-bottom-bar game-bottom-bar" :class="{ idle: !inGame }">
            <template v-if="!inGame">
                <BottomBarButton :items="DIFFICULTIES.map(d => ({
                    label: DIFFICULTY_NAMES[d], active: difficulty === d, click: () => setDifficulty(d),
                }))" />
                <div class="game-bar-row">
                    <BottomBarButton icon="shuffle" label="Random" :active="random" @click="toggleRandom" />
                    <BottomBarButton v-if="hasQuestions" icon="play" label="Play" @click="startGame" />
                </div>
            </template>
            <div v-else class="game-bar-row">
                <BottomBarButton icon="skip-start" label="Return" :class="{ 'paused-only': gameState !== 'paused' }"
                                 @click="confirmReturnToIdle" />
                <BottomBarButton :icon="gameState === 'paused' ? 'play' : 'pause'"
                                 :label="gameState === 'paused' ? 'Resume' : 'Pause'"
                                 :class="{ disabled: gameState === 'feedback' || (gameState === 'paused' && currentAnswered) }"
                                 @click="gameState === 'paused' ? resumeGame() : pauseGame()" />
            </div>
        </div>

        <!-- BOTTOM BAR: Edit mode -->
        <div v-if="editMode" class="bottom-bar edit-bottom-bar">
            <BottomBarButton icon="x" :iconSize="15" label="Cancel" @click="exitEditMode" />
            <BottomBarButton :items="[
                { icon: 'export', label: 'Standard View', active: !editRaw, click: () => setEditRaw(false) },
                { icon: 'export', label: 'Raw View', active: editRaw, click: () => setEditRaw(true) },
            ]" />
            <BottomBarButton icon="export" label="Save" @click="onEditSaveClick" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, useTemplateRef, onMounted, onBeforeUnmount } from "vue";
import { useAppStore } from '@/stores/appStore'
import { PageModel } from "@/wordManagement/PageModel";
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

const DIFFICULTIES = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD, Difficulty.CUSTOM]

const appStore = useAppStore()
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

// Baslamadan once gosterilen ilk soru suresi guncel ayara gore yenilenir.
const refreshIdleDuration = () => {
    if (gameState.value === 'idle') {
        questionDuration.value = getQuestionDuration(0, questions.value.length, difficulty.value) * 1000
    }
}

// Secici sadece oyun disinda gorunur; yeni zorluk bir sonraki Start'ta gecerli olur.
const setDifficulty = (d: Difficulty) => {
    difficulty.value = d
    refreshIdleDuration()
    try {
        addOrUpdate(DIFFICULTY_LOCAL_STORAGE_KEY, String(d))
    } catch { /* localStorage erisilemiyorsa sadece bu oturumda gecerli */ }
}

// CUSTOM: input'taki deger esastir; slider en fazla CUSTOM_SLIDER_MAX gosterir.
const initialCustom = loadCustomDuration()
const customFirstInput = ref<string | number>(initialCustom.first)
const customLastInput = ref<string | number>(initialCustom.last)
const customInvalid = ref(false)

// Panelde gosterilen: Custom'da kullanicinin girisi, hazir zorlukta o zorlugun araligi (ilk = max, son = min).
const isCustom = computed(() => difficulty.value === Difficulty.CUSTOM)
const shownDuration = computed(() => {
    if (difficulty.value === Difficulty.CUSTOM) return { first: customFirstInput.value, last: customLastInput.value }
    const r = DIFFICULTY_DURATION_RANGES[difficulty.value]
    return { first: r.max, last: r.min }
})

// Gecersiz giris kaydedilmez, son gecerli deger kalir; input kirmizi gosterilir.
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
// idle: sayfa acildi, Start'a (▶) basilmadi. Quiz kendiliginden baslamaz.
// feedback: cevap verildi, dogru / yanlis animasyonu gosteriliyor (timer durmus, tiklama kilitli).
const gameState = ref<GameState>('idle')
// Tur suruyor: zorluk, random ve edit kapali.
const inGame = computed(() =>
    gameState.value === 'playing' || gameState.value === 'paused' || gameState.value === 'feedback')
const pickedIndex = ref(-1)
const endReason = ref<EndReason>('done')
// Soru basina: dogru bilindi mi, ve harcanan sure (ms; 0 = hic baslamadi, tam sure).
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

// Dogru sik: feedback / over'da ve cevaplanmis soruya geri gidilince (salt goruntu) yesil.
const showCorrect = computed(() =>
    gameState.value === 'over' || gameState.value === 'feedback'
    || (gameState.value === 'paused' && currentAnswered.value))
const showPicked = computed(() => gameState.value === 'over' || gameState.value === 'feedback')

// Aktif sorunun suresi ve gecen zaman (ms).
const questionDuration = ref(0)
const elapsed = ref(0)
let questionStartedAt = 0
let rafId: number | undefined

const timerProgress = computed(() => {
    if (questionDuration.value <= 0) return 0
    return Math.min(1, elapsed.value / questionDuration.value)
})
const remainingText = computed(() => {
    // Tam saniye; son 3 sn ondalikli (prototype.html #2).
    const left = Math.max(0, questionDuration.value - elapsed.value) / 1000
    return left >= 3 ? String(Math.ceil(left)) : left.toFixed(1)
})

// Siklar her zaman karistirilir (veride dogru sik hep ilk); soru sirasi sadece Random aciksa.
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

// Yeni tur hazirlanir ve ilk soru, sayac dolmadan, ▶'nun arkasinda soluk gorunur.
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
    // Oyun bittiyse yeni tur; idle'da zaten hazirlanmis tur kullanilir.
    if (gameState.value === 'over') prepareGame()
    if (questions.value.length === 0) return
    gameState.value = 'playing'
    startQuestion(0)
}

// Soru, daha once harcanan sure varsa kaldigi yerden gosterilir (atlanip donulen soru).
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

// Siradaki cevaplanmamis soru; sonda geride atlanmis soru varsa basa sarar. Yoksa -1.
const nextUnanswered = (from: number): number => {
    const n = questions.value.length
    for (let k = 1; k <= n; k++) {
        const i = (from + k) % n
        if (!answered.value[i]) return i
    }
    return -1
}

// Gecen sure (elapsed) korunur; devamda baslangic ani o kadar geri alinir.
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

// Sadece paused'da; gezinince paused kalinir.
const goToQuestion = (i: number) => {
    if (gameState.value !== 'paused' || i < 0 || i >= questions.value.length) return
    elapsedPerQuestion.value[questionIndex.value] = elapsed.value
    showQuestion(i)
}

// Paused'da tur bitirilip zorluk secimine (idle) donulur; kayitli tur da silinir.
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

// picked = -1: sure bitti. Timer durur, ANSWER_FEEDBACK_MS boyunca sonuc gosterilir.
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
 * === OYUN DURUMU (sadece yenilemede) ===
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

// Oynanirken / feedback'te kaydedilen durum paused'dur: yenilemeden sonra oyun paused acilir.
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

// Kayitli tur bu sayfanin guncel soru sayisiyla uyusuyorsa geri yuklenir.
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

// Kayittan sonra loadPages yeni bir PageModel getirir: baslik ve tur yenilenir.
// Oyun sirasinda kayit yapilamadigi icin oynanan tur hic bozulmaz.
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
const editRawModeString = ref('')
const editSaving = ref(false)
// Iki gorunum ayni veriyi paylasir: gecerken raw metin yeniden ayrisir / yeniden yazilir.
// editQuestions'ta dogru sik her zaman ilk siktir (formattaki gibi).
const editRaw = ref(false)
const editQuestions = ref<MultipleChoiceQuestion[]>([])
const editIndex = ref(0)
// -1 = soru metni, i = i. sik, null = hicbiri.
const editingField = ref<number | null>(null)
const editCurrent = computed(() => editQuestions.value[editIndex.value])

const showError = (message: string) => {
    showConfirmationPopup({
        title: message,
        buttons: [{ name: 'OK', click: closeConfirmationPopup }],
    })
}

// Bos soru (yeni eklenen, henuz yazilmamis) ve bos siklar kaydedilmez / raw'a yazilmaz.
const isEmptyQuestion = (q: MultipleChoiceQuestion) => q.question.trim() === '' && q.answers.every(a => a.trim() === '')
const emptyQuestion = (): MultipleChoiceQuestion => ({ question: '', answers: [''], correctIndex: 0 })
const cleanEditQuestions = () => editQuestions.value
    .filter(q => !isEmptyQuestion(q))
    .map(q => ({ question: q.question, answers: q.answers.filter(a => a.trim() !== ''), correctIndex: 0 }))
const formatEditQuestions = () => WordManager.instance.formatMultipleChoiceForExport(cleanEditQuestions())

// Sondaki bos (yazilmamis) yeni soru sayilmaz: "N+1 / N"; yazilinca "N+1 / N+1".
const editTotal = computed(() => {
    const qs = editQuestions.value
    return qs.length > 0 && isEmptyQuestion(qs[qs.length - 1]) ? qs.length - 1 : qs.length
})

// Ekrandaki sorunun sonunda hep bir bos sik karti olur; yazilinca yenisi eklenir.
// Duzenleme bitince aradaki bos siklar silinir.
watch([editCurrent, editingField], () => {
    const q = editCurrent.value
    if (!q) return
    if (editingField.value === null) {
        const filled = q.answers.filter(a => a !== '')
        if (filled.length + 1 !== q.answers.length || q.answers[q.answers.length - 1] !== '') q.answers = [...filled, '']
    } else if (q.answers[q.answers.length - 1] !== '') {
        q.answers.push('')
    }
}, { deep: true })

const setEditQuestions = (qs: MultipleChoiceQuestion[]) => {
    editQuestions.value = qs.length > 0 ? qs : [emptyQuestion()]
}

const enterEditMode = () => {
    if (!page.value || (inGame.value && gameState.value !== 'paused')) return
    editTitle.value = page.value.name
    editRaw.value = false
    editingField.value = null
    setEditQuestions(WordManager.instance.setupMultipleChoice(
        WordManager.instance.formatMultipleChoiceForExport(page.value.questions)))
    // Quiz'deki (karisik) soru, kaynak sirasinda metniyle bulunur.
    const i = editQuestions.value.findIndex(q => q.question === current.value?.question)
    editIndex.value = i >= 0 ? i : 0
    editMode.value = true
}

// Son sorudan ileri: bos yeni soru acilir. Yazilmadan ayrilinan bos yeni soru atilir.
const goToEditQuestion = (i: number) => {
    if (i < 0 || i > editTotal.value) return
    editingField.value = null
    const qs = editQuestions.value
    const last = qs.length - 1
    if (editIndex.value === last && i !== last && qs.length > 1 && isEmptyQuestion(qs[last])) qs.pop()
    if (i >= qs.length) qs.push(emptyQuestion())
    editIndex.value = i
}

const setFieldEditing = (field: number, on: boolean) => {
    if (on) editingField.value = field
    else if (editingField.value === field) editingField.value = null
}

const setEditRaw = (raw: boolean) => {
    if (raw === editRaw.value) return
    editingField.value = null
    if (raw) {
        editRawModeString.value = formatEditQuestions()
    } else {
        setEditQuestions(WordManager.instance.setupMultipleChoice(editRawModeString.value))
        editIndex.value = Math.max(0, Math.min(editIndex.value, editQuestions.value.length - 1))
    }
    editRaw.value = raw
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

    const words = (editRaw.value
        ? editRawModeString.value
        : formatEditQuestions()).replace(/\n+$/, '')
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
        // Edit mode acik kalir, kullanici yazdigini kaybetmez.
        showError(`Could not save: ${res.error ?? 'unknown error'}`)
        return
    }

    // Kayittan sonra ayni sorudan devam edilir.
    const oldText = parsed[Math.min(editIndex.value, parsed.length - 1)].question
    const oldIndex = questionIndex.value

    await appStore.loadPages()
    await nextTick() // page watch'i (idle / over'da prepareGame) calissin
    if (gameState.value === 'paused' && page.value) {
        // Paused tur yeni sorularla kurulur; cevaplanmis / harcanan sure soru metniyle tasinir.
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
    // Yenilemede unmount calismaz; oynanirken gecen sure burada kaydedilir.
    window.addEventListener('pagehide', saveGameState)
})

onBeforeUnmount(() => {
    stopTimer()
    clearFeedbackTimeout()
    window.removeEventListener('pagehide', saveGameState)
    // Uygulama icinde sayfadan cikinca tur temizlenir; tekrar giriste baslangictan acilir.
    clearPageState(gameStateKey(), 'session')
    TimeSpentHandler.instance.stopRecording(`page${props.pageId}`)
})
</script>

<style src="./PageMultipleChoice.scss" lang="scss"></style>
