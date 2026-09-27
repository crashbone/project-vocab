<template>
    <div v-if="!page"></div>
    <div v-else class="app-frame page words multiple-choice" :class="{ 'edit-mode-active': editMode }">
        <!-- TOP BAR: baslik ve edit sadece oyun duraklamisken (idle / over) degisebilir. -->
        <PageWithWordsTopBar
                             :title="editMode ? editTitle : title"
                             :titleAdjustable="gameState !== 'playing'"
                             :backHandler="editMode ? exitEditMode : undefined"
                             @update:title="editMode ? (editTitle = $event) : (title = $event)"
                             @commit:title="onTitleCommit">
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
            <template v-else-if="gameState !== 'playing'" #right>
                <SvgX class="pointer" url="/main/src/frontend/assets/svg/pencil.svg" :width="22" :height="22"
                      @click="enterEditMode" />
            </template>
        </PageWithWordsTopBar>

        <!-- CONTENT: Edit mode (sadece Raw, AddPage'deki gibi) -->
        <div v-if="editMode" class="page-content-container-1">
            <textarea v-model="editRawModeString" class="raw-mode" />
        </div>

        <!-- CONTENT -->
        <div v-else class="page-content-container-1">
            <!-- Sadece oyun disinda (baslamadan once / bitince) gorunur; yeri korunur, icerik kaymaz. -->
            <div class="difficulty-bar" :class="{ hidden: gameState === 'playing' }">
                <div class="segmented-control">
                    <div v-for="d in DIFFICULTIES" :key="d"
                         class="segment pointer" :class="{ active: difficulty === d }"
                         @click="setDifficulty(d)">
                        {{ DIFFICULTY_NAMES[d] }}
                    </div>
                </div>
            </div>

            <div class="quiz-area">
                <template v-if="current">
                    <div class="question-row">
                        <!-- Kalan sure: halka soru basinda bos, sure bitince tam dolu (lineer). -->
                        <div class="mc-timer">
                            <svg viewBox="0 0 36 36">
                                <circle class="mc-timer-track" cx="18" cy="18" :r="TIMER_RADIUS" />
                                <circle class="mc-timer-progress" cx="18" cy="18" :r="TIMER_RADIUS"
                                        :stroke-dasharray="TIMER_CIRCUMFERENCE"
                                        :stroke-dashoffset="TIMER_CIRCUMFERENCE * (1 - timerProgress)" />
                            </svg>
                            <div class="mc-timer-text">{{ remainingText }}</div>
                        </div>
                        <div class="question">{{ current.question }}</div>
                    </div>
                    <div class="answers">
                        <ButtonX v-for="(answer, i) in current.answers" :key="`${questionIndex}-${i}`"
                                 class="size80px"
                                 :class="{
                                     correct: gameState === 'over' && i === current.correctIndex,
                                     wrong: gameState === 'over' && i === pickedIndex && i !== current.correctIndex,
                                 }"
                                 :index="i"
                                 :shining_border_animation="false"
                                 @click="onAnswerClick(i)">
                            <div class="button-content2">
                                <div class="text">{{ answer }}</div>
                            </div>
                        </ButtonX>
                    </div>
                </template>
                <div v-else-if="!hasQuestions" class="question">This page has no questions.</div>

                <!-- Baslamadan once ve oyun bitince: header ve zorluk secimi acik kalir, sadece sorular kaplanir. -->
                <div v-if="gameState !== 'playing' && hasQuestions" class="play-overlay pointer" @click="startGame">
                    <div class="play-button">
                        <div class="play-triangle"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- BOTTOM BAR: Edit mode -->
        <div v-if="editMode" class="bottom-bar edit-bottom-bar">
            <LiquidGlass class="bottom-bar-liquid-glass edit-bar-cancel" @click="exitEditMode">
                <div class="liquid-glass-card-slot-content">
                    <div class="bottom-bar-button pointer">
                        <div class="bottom-bar-button-top">
                            <SvgX url="/main/src/frontend/assets/svg/x.svg" :width="15" :height="15" />
                        </div>
                        <div class="bottom-bar-button-bottom">Cancel</div>
                    </div>
                </div>
            </LiquidGlass>
            <LiquidGlass class="bottom-bar-liquid-glass edit-bar-save" @click="onEditSaveClick">
                <div class="liquid-glass-card-slot-content">
                    <div class="bottom-bar-button pointer">
                        <div class="bottom-bar-button-top">
                            <SvgX url="/main/src/frontend/assets/svg/export.svg" :width="18" :height="18" />
                        </div>
                        <div class="bottom-bar-button-bottom">Save</div>
                    </div>
                </div>
            </LiquidGlass>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useAppStore } from '@/stores/appStore'
import { PageModel } from "@/wordManagement/PageModel";
import { WordManager, type MultipleChoiceQuestion } from "@/wordManagement/wordManager";
import { sendUpdatePageRequest } from "@/wordManagement/updatePageRequest";
import { showConfirmationPopup, closeConfirmationPopup } from '@/NonPageComponents/ConfirmationPopup/confirmationPopup'
import {
    Difficulty, DIFFICULTY_NAMES, DIFFICULTY_LOCAL_STORAGE_KEY,
    getQuestionDuration, loadDifficulty,
} from "@/wordManagement/Difficulty";
import { TimeSpentHandler } from "@/junk/TimeSpentHandler";
import { addOrUpdate } from "@/junk/localStorageHandler";
import { toDashboard } from "@/junk/router";
import { shuffle } from "@/junk/util/shuffle";
import PageWithWordsTopBar from "@/NonPageComponents/PageWithWordsTopBar/PageWithWordsTopBar.vue";

const TIMER_RADIUS = 16
const TIMER_CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS
const DIFFICULTIES = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD, Difficulty.BRUTAL]

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

// Secici sadece oyun disinda gorunur; yeni zorluk bir sonraki Start'ta gecerli olur.
const setDifficulty = (d: Difficulty) => {
    difficulty.value = d
    // Baslamadan once gosterilen ilk soru suresi yeni zorluga gore guncellenir.
    if (gameState.value === 'idle') {
        questionDuration.value = getQuestionDuration(0, questions.value.length, d) * 1000
    }
    try {
        addOrUpdate(DIFFICULTY_LOCAL_STORAGE_KEY, String(d))
    } catch { /* localStorage erisilemiyorsa sadece bu oturumda gecerli */ }
}


/* ============
 * === GAME ===
 * ============ */

const questions = ref<MultipleChoiceQuestion[]>([])
const questionIndex = ref(0)
// idle: sayfa acildi, Start'a (▶) basilmadi. Quiz kendiliginden baslamaz.
const gameState = ref<'idle' | 'playing' | 'over'>('idle')
const pickedIndex = ref(-1)

const current = computed(() => questions.value[questionIndex.value])
const hasQuestions = computed(() => (page.value?.questions.length ?? 0) > 0)

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
    return (Math.max(0, questionDuration.value - elapsed.value) / 1000).toFixed(1)
})

// Sorular ve her sorunun siklari karistirilir; dogru sikkin yeni yeri correctIndex'e yazilir.
const buildShuffledQuestions = (source: MultipleChoiceQuestion[]): MultipleChoiceQuestion[] => {
    return shuffle(source.map(q => {
        const answers = shuffle(q.answers.map((text, i) => ({ text, correct: i === q.correctIndex })))
        return {
            question: q.question,
            answers: answers.map(a => a.text),
            correctIndex: answers.findIndex(a => a.correct),
        }
    }))
}

// Yeni karisik tur hazirlanir ve ilk soru, sayac dolmadan, ▶'nun arkasinda soluk gorunur.
const prepareGame = () => {
    if (!page.value) return
    stopTimer()
    questions.value = buildShuffledQuestions(page.value.questions)
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

const startQuestion = (i: number) => {
    questionIndex.value = i
    pickedIndex.value = -1
    questionDuration.value = getQuestionDuration(i, questions.value.length, difficulty.value) * 1000
    elapsed.value = 0
    questionStartedAt = performance.now()
    stopTimer()
    rafId = requestAnimationFrame(tick)
}

const tick = (now: number) => {
    elapsed.value = now - questionStartedAt
    if (elapsed.value >= questionDuration.value) {
        elapsed.value = questionDuration.value
        endGame()
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

const endGame = () => {
    stopTimer()
    gameState.value = 'over'
}

const onAnswerClick = (i: number) => {
    if (gameState.value !== 'playing' || !current.value) return
    pickedIndex.value = i
    if (i !== current.value.correctIndex) {
        endGame()
        return
    }
    if (questionIndex.value + 1 >= questions.value.length) {
        endGame()
        return
    }
    startQuestion(questionIndex.value + 1)
}

const title = ref('')

// Kayittan sonra loadPages yeni bir PageModel getirir: baslik ve tur yenilenir.
// Oyun sirasinda kayit yapilamadigi icin oynanan tur hic bozulmaz.
watch(page, (newPage, oldPage) => {
    if (!newPage || newPage === oldPage) return
    title.value = newPage.name
    if (gameState.value !== 'playing') prepareGame()
}, { immediate: true })


/* ====================
 * === TITLE / EDIT ===
 * ==================== */

const editMode = ref(false)
const editTitle = ref('')
const editRawModeString = ref('')
const editSaving = ref(false)

const showError = (message: string) => {
    showConfirmationPopup({
        title: message,
        buttons: [{ name: 'OK', click: closeConfirmationPopup }],
    })
}

// PageWords.onTitleCommit ile ayni akis; sorular mevcut modelden yeniden yazilir.
const onTitleCommit = async () => {
    if (editMode.value || !page.value) return

    const newTitle = title.value.trim()
    if (newTitle === page.value.name) return

    if (newTitle === '') {
        title.value = page.value.name
        showError('Title cannot be empty.')
        return
    }

    const previousTitle = page.value.name
    const res = await sendUpdatePageRequest({
        id: page.value.id,
        name: newTitle,
        description: page.value.description,
        words: WordManager.instance.formatMultipleChoiceForExport(page.value.questions),
    })

    if (!res.success) {
        title.value = previousTitle
        showError(`Could not save title: ${res.error ?? 'unknown error'}`)
        return
    }

    await appStore.loadPages()
}

const enterEditMode = () => {
    if (!page.value || gameState.value === 'playing') return
    editTitle.value = page.value.name
    editRawModeString.value = WordManager.instance.formatMultipleChoiceForExport(page.value.questions)
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

    const words = editRawModeString.value.replace(/\n+$/, '')
    if (WordManager.instance.setupMultipleChoice(words).length === 0) {
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

    await appStore.loadPages()
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
})

onBeforeUnmount(() => {
    stopTimer()
    TimeSpentHandler.instance.stopRecording(`page${props.pageId}`)
})
</script>

<style src="./PageMultipleChoice.scss" lang="scss"></style>
