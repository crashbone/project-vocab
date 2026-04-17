<template>
    <div v-if="!page"></div>
    <div v-else class="app-frame page words" :class="{ 'selection-mode': selectionMode, 'edit-mode-active': editMode }">
        <!-- TOP BAR -->
        <PageWithWordsTopBar
                             :title="editMode ? editTitle : title"
                             :titleAdjustable="editMode ? true : !selectionMode"
                             :backDisabled="selectionMode"
                             :backHandler="editMode ? exitEditMode : undefined"
                             @update:title="editMode ? (editTitle = $event) : (title = $event)">
            <template v-if="editMode && editViewMode === ViewMode.RAW" #right>
                <SvgX v-tooltip="{
                    title: 'How to use Raw View',
                    body: `Separate two sides of the flash card with:
'    ' (4 spaces) or
' | ' (one space, one '|', one space)

Separate new words with new line (ENTER):
der Mann | Man
die Frau | Woman
der Apfel | Apple
das Auto    Car
das Buch    Book
das Kind    Child`
                }" class="pointer" url="/main/src/assets/svg/question.svg" :width="31" :height="31" />
            </template>
            <template v-else #right>
                <template v-if="!selectionMode && !editMode">
                    <!-- TEMPORARILY DISABLED -->
                    <!-- <SvgX class="pointer" url="/main/src/frontend/assets/svg/pencil.svg" :width="22" :height="22"
                          @click="enterEditMode" /> -->
                    <SvgX class="pointer" url="/main/src/frontend/assets/svg/check.svg" :width="28" :height="28"
                          @click="enterSelectionMode" />
                    <div class="pointer profile-icon">C</div>
                </template>
            </template>
        </PageWithWordsTopBar>

        <!-- CONTENT: Normal / Selection mode -->
        <div v-if="!editMode" class="page-content-container-1">
            <template v-for="(word, index) in page!.wordModels" :key="index">
                <ButtonX @click="wordClick(index)"
                         @dblclick="wordDblClick(index)"
                         :shining_border_animation="word.marker"
                         class="size80px" :class="[
                             `wordMode${word.mode}`,
                             { 'selected-word': selectionMode && selectedIndices.has(index) }
                         ]"
                         :index="index">
                    <div class="button-content2" ref="wordRefs">
                        <div class="text">{{ word.context }}</div>
                        <div class="bullets">
                            <div class="bullet" v-for="i in 3" :key="i"
                                 :class="{ active: word.mode === i - 1 }"></div>
                        </div>
                    </div>
                </ButtonX>
            </template>
        </div>

        <!-- CONTENT: Edit mode - Standard -->
        <div v-else-if="editViewMode === ViewMode.STANDARD" class="page-content-container-1">
            <template v-for="(word, index) in editWordObjects" :key="index">
                <div class="row">
                    <ButtonX class="size80px" :class="{ 'edit-mode': word.w1EditMode }" :index="index"
                             @click="onEditWordClick(index, 1)">
                        <div class="button-content2">
                            <div class="text" :class="{placeholder: !word.w1}">
                                <div v-show="!word.w1EditMode">{{ word.w1 || 'tap to add' }}</div>
                                <textarea v-show="word.w1EditMode" ref="editWordInputs1"
                                          @blur="onEditWordFocusOut(index, 1)" type="text" size='' v-model="word.w1" />
                            </div>
                            <div class="bullets">
                                <div class="bullet" v-for="i in 2" :key="i"
                                     :class="{ active: i === 1 }"></div>
                            </div>
                        </div>
                    </ButtonX>
                    <ButtonX class="size80px" :class="{ 'edit-mode': word.w2EditMode }" :index="index"
                             @click="onEditWordClick(index, 2)">
                        <div class="button-content2">
                            <div class="text" :class="{placeholder: !word.w2}">
                                <div v-show="!word.w2EditMode">{{ word.w2 || 'tap to add' }}</div>
                                <textarea v-show="word.w2EditMode" ref="editWordInputs2"
                                          @blur="onEditWordFocusOut(index, 2)" type="text" size='' v-model="word.w2" />
                            </div>
                            <div class="bullets">
                                <div class="bullet" v-for="i in 2" :key="i"
                                     :class="{ active: i === 2 }"></div>
                            </div>
                        </div>
                    </ButtonX>
                </div>
            </template>
        </div>

        <!-- CONTENT: Edit mode - Raw -->
        <div v-else-if="editViewMode === ViewMode.RAW" class="page-content-container-1">
            <textarea v-model="editRawModeString" class="raw-mode" />
        </div>

        <!-- BOTTOM BAR: Normal mode -->
        <div v-if="!selectionMode && !editMode" class="bottom-bar" style="width: 270px">
            <LiquidGlass class="bottom-bar-liquid-glass">
                <div class="liquid-glass-card-slot-content">
                    <div class="bottom-bar-button pointer" v-for="(obj, index) in [
                        {
                            icon: 'export',
                            name: 'Export',
                            size: 18,
                            click: (e: Event) => { openExportMenu(e) },
                        },
                        {
                            icon: 'shuffle',
                            name: 'Shuffle',
                            size: 20,
                            click: () => { shuffleClick() },
                        },
                        {
                            icon: 'toggle-all',
                            name: 'Toggle All',
                            size: 17,
                            click: () => { toggleClick() },
                        },
                        // {
                        //     icon: 'appearance',
                        //     name: 'Appearance',
                        //     size: 19,
                        // }
                    ]" :key="index" @click="obj.click">
                        <div class="bottom-bar-button-top">
                            <SvgX :url="`/main/src/frontend/assets/svg/${obj.icon}.svg`" :width="obj.size" :height="obj.size" />
                        </div>
                        <div class="bottom-bar-button-bottom">{{ obj.name }}</div>
                    </div>
                </div>
            </LiquidGlass>
        </div>

        <!-- BOTTOM BAR: Selection mode -->
        <div v-else-if="selectionMode" class="bottom-bar selection-bottom-bar">
            <LiquidGlass class="bottom-bar-liquid-glass" @click="openExportMenu($event)">
                <div class="liquid-glass-card-slot-content">
                    <div class="bottom-bar-button pointer">
                        <div class="bottom-bar-button-top">
                            <SvgX url="/main/src/frontend/assets/svg/export.svg" :width="18" :height="18" />
                        </div>
                        <div class="bottom-bar-button-bottom">Export</div>
                    </div>
                </div>
            </LiquidGlass>
            <LiquidGlass class="bottom-bar-liquid-glass" @click="exitSelectionMode">
                <div class="liquid-glass-card-slot-content">
                    <div class="bottom-bar-button pointer">
                        <div class="bottom-bar-button-top">
                            <SvgX url="/main/src/frontend/assets/svg/x.svg" :width="15" :height="15" />
                        </div>
                        <div class="bottom-bar-button-bottom">Cancel</div>
                    </div>
                </div>
            </LiquidGlass>
        </div>

        <!-- BOTTOM BAR: Edit mode -->
        <div v-else-if="editMode" class="bottom-bar edit-bottom-bar">
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
            <LiquidGlass class="bottom-bar-liquid-glass edit-bar-middle">
                <div class="liquid-glass-card-slot-content">
                    <div class="bottom-bar-button pointer" @click="onEditViewModeChange(ViewMode.STANDARD)">
                        <transition name="modeSwitch-scale">
                            <div v-if="editViewMode === ViewMode.STANDARD" class="animation-overlay"></div>
                        </transition>
                        <div class="bottom-bar-button-top">
                            <SvgX url="/main/src/frontend/assets/svg/export.svg" :width="18" :height="18" />
                        </div>
                        <div class="bottom-bar-button-bottom">Standard View</div>
                    </div>
                    <div class="bottom-bar-button pointer" @click="onEditViewModeChange(ViewMode.RAW)">
                        <transition name="modeSwitch-scale">
                            <div v-if="editViewMode === ViewMode.RAW" class="animation-overlay"></div>
                        </transition>
                        <div class="bottom-bar-button-top">
                            <SvgX url="/main/src/frontend/assets/svg/export.svg" :width="18" :height="18" />
                        </div>
                        <div class="bottom-bar-button-bottom">Raw View</div>
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
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, type Ref } from "vue";
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
import { WordManager } from "@/wordManagement/wordManager";
import PageWithWordsTopBar from "@/NonPageComponents/PageWithWordsTopBar/PageWithWordsTopBar.vue";

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
const editMode = ref(false);
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
    onStopRecording()
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
    }
}, { immediate: true })


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
const editWordObjects = ref<{ w1: string, w1EditMode: boolean, w2: string, w2EditMode: boolean }[]>([])
const editWordInputs1: Ref<HTMLElement[]> = ref([])
const editWordInputs2: Ref<HTMLElement[]> = ref([])
const editRawModeString = ref('')
const editViewMode = ref(ViewMode.STANDARD)

const enterEditMode = () => {
    if (!page.value) return
    editTitle.value = page.value.name
    editWordObjects.value = page.value.wordModels.map(wm => {
        const left = wm.hasArtikel ? `${wm.artikel} ${wm.word}` : wm.word
        return {
            w1: left,
            w1EditMode: false,
            w2: wm.meaning,
            w2EditMode: false,
        }
    })
    editViewMode.value = ViewMode.STANDARD
    editRawModeString.value = ''
    onEditWordObjectsChanged()
    editMode.value = true
}

const exitEditMode = () => {
    editMode.value = false
}

const onEditWordClick = (i: number, wi: number) => {
    const word = editWordObjects.value[i]
    if (wi === 2) { word.w2EditMode = true } else { word.w1EditMode = true }
    nextTick().then(() => {
        if (wi === 2) { editWordInputs2.value[i]?.focus(); return }
        if (wi === 1) { editWordInputs1.value[i]?.focus(); return }
    })
}

const onEditWordFocusOut = (i: number, wi: number) => {
    const word = editWordObjects.value[i]
    if (wi === 2) { word.w2EditMode = false } else { word.w1EditMode = false }
}

const onEditViewModeChange = (vm: ViewMode) => {
    if (vm === ViewMode.RAW) {
        editRawModeString.value = getEditRawModeTextFromInputs()
    }
    if (vm === ViewMode.STANDARD) {
        const wordModels = WordManager.instance.setupWords(editRawModeString.value)
        editWordObjects.value = wordModels.map(wm => ({
            w1: wm.word, w1EditMode: false,
            w2: wm.meaning, w2EditMode: false,
        }))
        onEditWordObjectsChanged()
    }
    editViewMode.value = vm
}

const getEditRawModeTextFromInputs = () => {
    return editWordObjects.value.map(wObj => [wObj.w1, wObj.w2].join(' | ')).join('\n')
}

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

const onEditSaveClick = () => {
    // TODO: not implemented — send edit request to backend
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

const formatWordsForExport = (words: WordModel[]): string => {
    return words.map(w => {
        const left = w.hasArtikel ? `${w.artikel} ${w.word}` : w.word
        return `${left} | ${w.meaning}`
    }).join('\n')
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
    const text = formatWordsForExport(words)

    const copyLabel = 'Copy'
    showConfirmationPopup({
        title: `${words.length} words`,
        buttons: [
            {
                name: copyLabel,
                click: async () => {
                    // TODO: backend/request/response related part
                    await navigator.clipboard.writeText(text)
                    closeConfirmationPopup()
                },
            },
            {
                name: 'Download',
                click: () => {
                    // TODO: backend/request/response related part
                    const blob = new Blob([text], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `${title.value || 'words'}.txt`
                    a.click()
                    URL.revokeObjectURL(url)
                    closeConfirmationPopup()
                },
            },
        ],
    })
}


/* ===============
 * === METHODS ===
 * =============== */

const wordClick = async (i: number) => {
    if (selectionMode.value) {
        toggleSelection(i)
        return
    }
    const el = wordRefs.value[i] as HTMLElement;
    dynamicHeightSetUtil(el, () => { nextMode(i) });
}

const wordDblClick = (i: number) => {
    if (selectionMode.value) return
    page.value?.wordModels[i]?.setMarker(!page.value?.wordModels[i].marker);
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