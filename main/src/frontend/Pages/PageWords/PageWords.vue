<template>
    <div v-if="!page"></div>
    <div v-else class="app-frame page words" :class="{ 'selection-mode': selectionMode, 'edit-mode-active': editMode }">
        <!-- TOP BAR -->
        <PageWithWordsTopBar
                             :title="editMode ? editTitle : title"
                             :titleAdjustable="editMode"
                             :backDisabled="selectionMode || editMode"
                             @update:title="editTitle = $event">
            <template v-if="editMode && editViewMode === ViewMode.RAW" #right>
                <SvgX v-tooltip="wordsHelpTooltip" class="pointer" url="/main/src/frontend/assets/svg/question.svg" :width="31" :height="31" />
            </template>
            <template v-else #right>
                <template v-if="!selectionMode && !editMode">
                    <SvgX class="pointer" url="/main/src/frontend/assets/svg/pencil.svg" :width="22" :height="22"
                          @click="enterEditMode" />
                    <SvgX class="pointer" url="/main/src/frontend/assets/svg/check.svg" :width="28" :height="28"
                          @click="enterSelectionMode" />
                    <ProfileIcon />
                </template>
            </template>
        </PageWithWordsTopBar>

        <!-- CONTENT: Normal / Selection mode -->
        <div v-if="!editMode" ref="listContainer" class="page-content-container-1" @scroll="saveState">
            <template v-for="(word, index) in page!.wordModels" :key="index">
                <ButtonX @click="wordClick(index)"
                         @[LONG_TAP_EVENT]="(e: Event) => onWordLongTap(e, index)"
                         @pointerdown="(e: PointerEvent) => lastPointerType = e.pointerType"
                         @contextmenu.prevent="(e: MouseEvent) => lastPointerType === 'mouse' && onWordLongTap(e, index)"
                         :shining_border_animation="word.marker"
                         class="size80px" :class="[
                             `wordMode${word.mode}`,
                             { 'selected-word': selectionMode && selectedIndices.has(index) }
                         ]"
                         :index="index">
                    <div class="button-content2" ref="wordRefs">
                        <div v-if="word.pinyin && word.mode !== WordMode.MEANING" class="text">
                            <template v-if="pinyinParts(word)">
                                <span v-for="(part, pi) in pinyinParts(word)" :key="pi" class="r"><span class="rt">{{ part.rt }}</span><span class="rb">{{ part.rb }}</span></span>
                            </template>
                            <span v-else class="r"><span class="rt">{{ word.pinyin }}</span><span class="rb">{{ word.word }}</span></span>
                            <template v-if="word.mode === WordMode.LONG"> &gt; {{ word.meaning }}</template>
                        </div>
                        <div v-else class="text">{{ word.context }}</div>
                        <div class="bullets">
                            <div class="bullet" v-for="i in 3" :key="i"
                                 :class="{ active: word.mode === i - 1 }"></div>
                        </div>
                    </div>
                </ButtonX>
            </template>
        </div>

        <!-- CONTENT: Edit mode - Standard -->
        <div v-else-if="editViewMode === ViewMode.STANDARD" ref="listContainer" class="page-content-container-1" @scroll="saveState">
            <template v-for="(word, index) in editWordObjects" :key="index">
                <div class="row">
                    <EditableCard v-for="wi in 2" :key="wi" :index="index"
                                  v-model="word[wi === 1 ? 'w1' : 'w2']"
                                  v-model:editing="word[wi === 1 ? 'w1EditMode' : 'w2EditMode']">
                        <div class="bullets">
                            <div class="bullet" v-for="i in 2" :key="i"
                                 :class="{ active: i === wi }"></div>
                        </div>
                    </EditableCard>
                </div>
            </template>
        </div>

        <!-- CONTENT: Edit mode - Raw -->
        <div v-else-if="editViewMode === ViewMode.RAW" class="page-content-container-1">
            <textarea v-model="editRawModeString" class="raw-mode" />
        </div>

        <!-- BOTTOM BAR: Normal mode -->
        <div v-if="!selectionMode && !editMode" class="bottom-bar" style="width: 270px">
            <BottomBarButton :items="[
                { icon: 'export', label: 'Export', click: openExportMenu },
                { icon: 'shuffle', label: 'Shuffle', iconSize: 20, click: shuffleClick },
                { icon: 'toggle-all', label: 'Toggle All', iconSize: 17, click: toggleClick },
            ]" />
        </div>

        <!-- BOTTOM BAR: Selection mode -->
        <div v-else-if="selectionMode" class="bottom-bar selection-bottom-bar">
            <BottomBarButton icon="export" label="Export" @click="openExportMenu($event)" />
            <BottomBarButton icon="trash" label="Delete" :class="{ disabled: selectedIndices.size === 0 }"
                             @click="confirmDeleteWords(selectedIndices, exitSelectionMode)" />
            <BottomBarButton icon="x" :iconSize="15" label="Cancel" @click="exitSelectionMode" />
        </div>

        <!-- BOTTOM BAR: Edit mode -->
        <div v-else-if="editMode" class="bottom-bar edit-bottom-bar">
            <BottomBarButton icon="x" :iconSize="15" label="Cancel" @click="exitEditMode" />
            <BottomBarButton :items="[
                { icon: 'export', label: 'Standard View', active: editViewMode === ViewMode.STANDARD, click: () => onEditViewModeChange(ViewMode.STANDARD) },
                { icon: 'export', label: 'Raw View', active: editViewMode === ViewMode.RAW, click: () => onEditViewModeChange(ViewMode.RAW) },
            ]" />
            <BottomBarButton icon="export" label="Save" @click="onEditSaveClick" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, useTemplateRef } from "vue";
import { useAppStore } from '@/stores/appStore'
import { showConfirmationPopup, closeConfirmationPopup } from '@/NonPageComponents/ConfirmationPopup/confirmationPopup'
import { showContextMenu } from '@/NonPageComponents/ContextMenu/contextMenu'
import { PageModel } from "@/wordManagement/PageModel";
import { TimeSpentHandler } from "@/junk/TimeSpentHandler";
import { enumLength } from "@/junk/util/enumLength"
import { WordMode } from "@/wordManagement/WordMode"
import { dynamicHeightSetUtil } from "@/junk/dynamicHeightSetUtil";
import { toDashboard } from "@/junk/router";
import { shuffle } from "@/junk/util/shuffle";
import type { WordModel } from "@/wordManagement/WordModel";
import { showExportPopup } from "@/junk/exportPopup";
import { WordManager, type WordRow } from "@/wordManagement/wordManager";
import { applyMarkers, saveMarkers } from "@/wordManagement/markerStore";
import { LONG_TAP_EVENT } from "@/directives/tap";
import { sendUpdatePageRequest } from "@/wordManagement/updatePageRequest";
import PageWithWordsTopBar from "@/NonPageComponents/PageWithWordsTopBar/PageWithWordsTopBar.vue";
import { savePageState, loadPageState, clearPageState, PAGE_STATE_KEYS } from "@/junk/pageStateService";
import { WORDS_RAW_HELP_TOOLTIP } from "@/wordManagement/wordsHelp";
import { useHelpTooltip, prependExample } from "@/composables/useHelpTooltip";

enum ViewMode {
    STANDARD = 0,
    RAW = 1,
}

/* ==================
 * === INITIALIZE ===
 * ================== */

const appStore = useAppStore()

const title = ref('');
const wordRefs = ref([]);
// Our own double click threshold: native @dblclick was set by the OS (~500ms)
// and could not be changed. Follows the threshold constant pattern in tap.ts:10-11.
const DOUBLE_CLICK_MS = 230;
// A single click is delayed this long: do not advance the mode while a double click is possible.
let singleClickTimer: ReturnType<typeof setTimeout> | undefined;
let pendingClickIndex = -1;
const editMode = ref(false);
// Word list / edit list (never rendered at the same time, shared ref).
const listContainer = useTemplateRef<HTMLElement>('listContainer');
const props = defineProps({
    pageId: String, // it has to be string, because url param
})

onMounted(() => {
    setTimeout(() => {
        if (!appStore.dashboardModel) {
            toDashboard();
            return;
        }
    }, 5000);
    onStartRecording();
})

onBeforeUnmount(() => {
    // Leaving within the app: state is cleared (unmount does not run on reload, so state stays).
    if (props.pageId) clearPageState(PAGE_STATE_KEYS.words(props.pageId), 'session')
    onStopRecording()
    clearTimeout(singleClickTimer)
})

const page = computed((): PageModel | undefined => {
    if (!props.pageId || !appStore.dashboardModel) {
        return undefined;
    }
    const pageId = Number.parseInt(props.pageId) || 0;
    return appStore.dashboardModel.pageModelMap![pageId]
})

watch(page, (newPage) => {
    if (newPage) {
        title.value = newPage.name
        // When the page (re)loads, saved highlights are restored by matching words.
        applyMarkers(newPage.id, newPage.wordModels)
    }
}, { immediate: true })


// If syllable count equals character count each syllable sits above its character; otherwise null (one piece).
const pinyinParts = (word: WordModel) => {
    const chars = Array.from(word.word)
    const syllables = (word.pinyin ?? '').split(/\s+/).filter(x => x !== '')
    if (syllables.length !== chars.length) return null
    return chars.map((rb, i) => ({ rb, rt: syllables[i] }))
}


/* ==================
 * === PAGE STATE ===
 * ================== */
// Restored only on reload (sessionStorage): mode, word order/modes, scroll, edit state.
type WordsPageState = {
    modeWords: WordMode
    words: { key: string, mode: WordMode }[]
    scroll: number
    editMode: boolean
    editTitle: string
    editWordObjects: { w1: string, w2: string }[]
    editRawModeString: string
    editViewMode: number
}
let stateRestored = false
const wordKey = (w: WordModel) => `${w.artikel}|${w.word}|${w.meaning}`

const saveState = () => {
    if (!page.value || !stateRestored) return
    savePageState(PAGE_STATE_KEYS.words(page.value.id), {
        modeWords: page.value.modeWords,
        words: page.value.wordModels.map(w => ({ key: wordKey(w), mode: w.mode })),
        scroll: listContainer.value?.scrollTop ?? 0,
        editMode: editMode.value,
        editTitle: editTitle.value,
        editWordObjects: editWordObjects.value.map(w => ({ w1: w.w1, w2: w.w2 })),
        editRawModeString: editRawModeString.value,
        editViewMode: editViewMode.value,
    } satisfies WordsPageState, 'session')
}

const restoreState = (p: PageModel) => {
    const state = loadPageState<WordsPageState>(PAGE_STATE_KEYS.words(p.id), 'session')
    if (!state) return
    // Reorder by the saved order; unmatched words go last.
    const pool = [...p.wordModels]
    const ordered: WordModel[] = []
    state.words.forEach(({ key, mode }) => {
        const idx = pool.findIndex(w => wordKey(w) === key)
        if (idx === -1) return
        const [w] = pool.splice(idx, 1)
        w.switchMode(mode)
        ordered.push(w)
    })
    p.wordModels.splice(0, p.wordModels.length, ...ordered, ...pool)
    p.modeWords = state.modeWords
    if (state.editMode) {
        editTitle.value = state.editTitle
        editWordObjects.value = state.editWordObjects.map(w => ({ w1: w.w1, w1EditMode: false, w2: w.w2, w2EditMode: false }))
        editRawModeString.value = state.editRawModeString
        editViewMode.value = state.editViewMode
        editMode.value = true
    }
    nextTick().then(() => {
        if (listContainer.value) listContainer.value.scrollTop = state.scroll
    })
}


/* ======================
 * === SELECTION MODE ===
 * ====================== */

const selectionMode = ref(false)
const selectedIndices = ref<Set<number>>(new Set())

const enterSelectionMode = () => {
    selectionMode.value = true
    selectedIndices.value = new Set()
}

const exitSelectionMode = () => {
    selectionMode.value = false
    selectedIndices.value = new Set()
}

const toggleSelection = (i: number) => {
    const s = new Set(selectedIndices.value)
    if (s.has(i)) {
        s.delete(i)
    } else {
        s.add(i)
    }
    selectedIndices.value = s
}


/* =================
 * === EDIT MODE ===
 * ================= */

const editTitle = ref('')
const editWordObjects = ref<WordRow[]>([])
const editRawModeString = ref('')
const wordsHelpTooltip = useHelpTooltip(WORDS_RAW_HELP_TOOLTIP, editRawModeString,
    (example) => { editRawModeString.value = prependExample(editRawModeString.value, example) })
const editViewMode = ref(ViewMode.STANDARD)

const enterEditMode = () => {
    if (!page.value) return
    scrollTopBeforeEdit = listContainer.value?.scrollTop ?? 0
    editTitle.value = page.value.name
    editWordObjects.value = page.value.wordModels.map(wm => WordManager.instance.wordRowFromModel(wm))
    editViewMode.value = ViewMode.STANDARD
    editRawModeString.value = ''
    onEditWordObjectsChanged()
    editMode.value = true
}

// List position before entering edit; after Cancel / Save the user returns to where they were.
let scrollTopBeforeEdit = 0

const exitEditMode = () => {
    editMode.value = false
    nextTick().then(() => {
        if (listContainer.value) listContainer.value.scrollTop = scrollTopBeforeEdit
    })
}

// Edit in the long-press menu: opens edit mode, scrolls to that word's row and edits its left box.
const editWordAt = (i: number) => {
    enterEditMode()
    nextTick().then(() => {
        const row = listContainer.value?.querySelectorAll('.row')[i]
        row?.scrollIntoView({ block: 'center' })
        const word = editWordObjects.value[i]
        if (word) word.w1EditMode = true
    })
}

const onEditViewModeChange = (vm: ViewMode) => {
    if (vm === ViewMode.RAW) {
        editRawModeString.value = getEditRawModeTextFromInputs()
    }
    if (vm === ViewMode.STANDARD) {
        editWordObjects.value = WordManager.instance.setupWordRows(editRawModeString.value)
        onEditWordObjectsChanged()
    }
    editViewMode.value = vm
}

// Unchanged rows keep the user's source line; empty rows (e.g. the trailing input row) are not written.
const getEditRawModeTextFromInputs = () => WordManager.instance.formatWordRows(editWordObjects.value)

const onEditWordObjectsChanged = () => {
    if (editWordObjects.value.some(w => w.w1EditMode || w.w2EditMode)) return
    const items = editWordObjects.value
    const withoutLast = items.slice(0, -1)
    const lastItem = items[items.length - 1]
    const emptyRowIndex = withoutLast.findIndex(w => w.w1 === '' && w.w2 === '')
    const allFilled = withoutLast.every(w => w.w1 !== '' || w.w2 !== '')

    if (emptyRowIndex !== -1) {
        editWordObjects.value = [
            ...withoutLast.filter(w => !(w.w1 === '' && w.w2 === '')),
            { w1: '', w1EditMode: false, w2: '', w2EditMode: false },
        ]
        return
    }
    if (allFilled && lastItem && (lastItem.w1 !== '' || lastItem.w2 !== '')) {
        editWordObjects.value = [...items, { w1: '', w1EditMode: false, w2: '', w2EditMode: false }]
    }
}

watch(editWordObjects, () => onEditWordObjectsChanged(), { deep: true })
// On first load the saved state is restored once (placed here so the definitions above are ready).
watch(page, (newPage) => {
    if (newPage && !stateRestored) {
        stateRestored = true
        restoreState(newPage)
    }
}, { immediate: true })
watch(() => [page.value?.wordModels, page.value?.modeWords, editMode.value, editTitle.value, editWordObjects.value, editRawModeString.value, editViewMode.value], saveState, { deep: true })

// Shared path for Delete in the long-press menu and Delete in selection mode.
// Remaining words are rewritten in their on-screen order (same serialization as export).
const deleteWords = async (indices: Set<number>) => {
    if (!page.value || indices.size === 0) return

    const remaining = page.value.wordModels.filter((_, i) => !indices.has(i))
    const res = await sendUpdatePageRequest({
        id: page.value.id,
        name: page.value.name,
        description: page.value.description,
        words: WordManager.instance.formatWordsForExport(remaining),
    })

    if (!res.success) {
        showConfirmationPopup({
            title: `Could not delete: ${res.error ?? 'unknown error'}`,
            buttons: [{ name: 'OK', click: closeConfirmationPopup }],
        })
        return
    }

    await appStore.loadPages()
}

const confirmDeleteWords = (indices: Set<number>, onDone?: () => void) => {
    if (indices.size === 0) return
    showConfirmationPopup({
        title: indices.size === 1 ? 'Delete this word?' : `Delete ${indices.size} words?`,
        buttons: [
            { name: 'Cancel', click: closeConfirmationPopup },
            {
                name: 'Delete',
                click: async () => {
                    closeConfirmationPopup()
                    await deleteWords(indices)
                    onDone?.()
                },
            },
        ],
    })
}

const editSaving = ref(false)

const onEditSaveClick = async () => {
    if (editSaving.value) return
    if (!page.value) return

    if (editTitle.value.trim() === '') {
        showConfirmationPopup({
            title: 'Title cannot be empty.',
            buttons: [{ name: 'OK', click: closeConfirmationPopup }],
        })
        return
    }

    // Whichever view is open on screen is the source of truth -- same choice as onEditViewModeChange.
    const wordsString = editViewMode.value === ViewMode.RAW
        ? editRawModeString.value
        : getEditRawModeTextFromInputs()

    // In Standard mode the last row is always an empty add row.
    const words = wordsString.replace(/\n+$/, '')

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
        showConfirmationPopup({
            title: `Could not save: ${res.error ?? 'unknown error'}`,
            buttons: [{ name: 'OK', click: closeConfirmationPopup }],
        })
        return
    }

    await appStore.loadPages()
    exitEditMode()
}


/* ==============
 * === EXPORT ===
 * ============== */

const hasMarked = computed(() => {
    return page.value?.wordModels.some(w => w.marker) ?? false
})

const hasSelected = computed(() => {
    return selectionMode.value && selectedIndices.value.size > 0
})

const openExportMenu = (event: Event) => {
    if (!hasMarked.value && !hasSelected.value) {
        exportWords('all')
        return
    }
    showContextMenu({
        event,
        items: [
            { name: 'Export Marked', disabled: !hasMarked.value, click: () => exportWords('marked') },
            { name: 'Export Selected', disabled: !hasSelected.value, click: () => exportWords('selected') },
            { name: 'Export All', click: () => exportWords('all') },
        ],
    })
}

const exportWords = (type: 'marked' | 'selected' | 'all') => {
    if (!page.value) return
    let words: WordModel[]
    if (type === 'marked') {
        words = page.value.wordModels.filter(w => w.marker)
    } else if (type === 'selected') {
        words = page.value.wordModels.filter((_, i) => selectedIndices.value.has(i))
    } else {
        words = page.value.wordModels
    }
    const text = WordManager.instance.formatWordsForExport(words)

    showExportPopup(`${words.length} words`, text, title.value || 'words')
}


/* ===============
 * === METHODS ===
 * =============== */

// The click following a long press (lifting the finger of the same gesture) must not change the word's mode.
// The next pointerdown clears the flag: later normal clicks are unaffected.
let suppressNextClick = false

// Right click with the mouse also opens the menu; on touch a long press already opens it via 'tap.long'.
let lastPointerType = ''

const onWordLongTap = (event: Event, i: number) => {
    if (selectionMode.value || !page.value) return
    const word = page.value.wordModels[i]
    if (!word) return

    suppressNextClick = true
    window.addEventListener('pointerdown', () => { suppressNextClick = false }, { once: true, capture: true })

    showContextMenu({
        event,
        items: [
            { name: word.marker ? 'Unmark' : 'Mark', click: () => wordDblClick(i) },
            { name: 'Copy', click: () => { navigator.clipboard.writeText(WordManager.instance.formatWordsForExport([word])) } },
            { name: 'Edit', click: () => editWordAt(i) },
            { name: 'Delete', click: () => confirmDeleteWords(new Set([i])) },
        ],
    })
}

const wordClick = async (i: number) => {
    if (suppressNextClick) {
        suppressNextClick = false
        return
    }
    if (selectionMode.value) {
        toggleSelection(i)
        return
    }

    // Second click on the same word within the threshold: the pending single click is cancelled, only the marker changes.
    if (singleClickTimer !== undefined && pendingClickIndex === i) {
        clearTimeout(singleClickTimer);
        singleClickTimer = undefined;
        pendingClickIndex = -1;
        wordDblClick(i);
        return;
    }

    // If another word is clicked, the pending click is applied immediately instead of being lost.
    if (singleClickTimer !== undefined) {
        clearTimeout(singleClickTimer);
        applySingleClick(pendingClickIndex);
    }

    pendingClickIndex = i;
    singleClickTimer = setTimeout(() => {
        singleClickTimer = undefined;
        pendingClickIndex = -1;
        applySingleClick(i);
    }, DOUBLE_CLICK_MS);
}

const applySingleClick = (i: number) => {
    const el = wordRefs.value[i] as HTMLElement;
    if (!el) return;
    dynamicHeightSetUtil(el, () => { nextMode(i) });
}

const wordDblClick = (i: number) => {
    if (selectionMode.value) return
    if (!page.value) return
    page.value.wordModels[i]?.setMarker(!page.value.wordModels[i].marker);
    saveMarkers(page.value.id, page.value.wordModels)
}

const nextMode = (i: number) => {
    page.value?.wordModels[i]?.nextMode();
}

const shuffleClick = () => {
    shuffle(page.value!.wordModels);
}

const toggleClick = () => {
    const mode = page.value!.modeWords;
    const nextMode = ((mode + 1) % enumLength(WordMode)) as WordMode;
    page.value!.wordModels.forEach((wordModel) => {
        wordModel.switchMode(nextMode);
    });
    page.value!.modeWords = nextMode;
}

/* =================
 * ===== TODOS =====
 * ================= */

// TODO: SHOULD BE MOVED INTO ITS OWN FILE, ONCE RECORD IS IMPLEMENTED

const onStartRecording = () => {
    const id = props.pageId;
    const timeSpentHandler = TimeSpentHandler.instance;
    timeSpentHandler.startRecording(`page${id}`);
}

const onStopRecording = () => {
    const id = props.pageId;
    const timeSpentHandler = TimeSpentHandler.instance;
    timeSpentHandler.stopRecording(`page${id}`);
}



</script>

<style src="./PageWords.scss" lang="scss"></style>