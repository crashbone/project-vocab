<template>
    <div class="app-frame page add_page">
        <!-- TOP BAR -->
        <PageWithWordsTopBar
                             :title="title"
                             :titleAdjustable="true"
                             :backHandler="onBackClick"
                             @update:title="title = $event">
            <template v-if="isMultipleChoice" #right>
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
            <template v-else-if="viewMode === ViewMode.RAW" #right>
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
        </PageWithWordsTopBar>

        <!----------------------------------------------------------------->
        <!---------------------------- CONTENT ---------------------------->
        <!----------------------------------------------------------------->

        <!-- CONTENT: Standard -->
        <div v-if="viewMode === ViewMode.STANDARD" ref="content" class="page-content-container-1" @scroll="saveDraft">
            <template v-for="(word, index) in wordObjects" :key="index">
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

        <!-- CONTENT: Raw -->
        <div v-else-if="viewMode === ViewMode.RAW" ref="content" class="page-content-container-1" @scroll="saveDraft">
            <textarea v-model="rawModeString" class="raw-mode" />
        </div>

        <div class="bottom-bar edit-bottom-bar">
            <!-- Bos sol blok (AddPage'de Cancel yok): Save sagda kalsin. -->
            <BottomBarButton />
            <BottomBarButton :items="isMultipleChoice ? [] : [
                { icon: 'export', label: 'Standard View', active: viewMode === ViewMode.STANDARD, click: () => onViewModeChange(ViewMode.STANDARD) },
                { icon: 'export', label: 'Raw View', active: viewMode === ViewMode.RAW, click: () => onViewModeChange(ViewMode.RAW) },
            ]" />
            <BottomBarButton icon="export" label="Save" @click="onSaveClick" />
        </div>
    </div>
</template>
<script setup lang="ts">
import router from "@/router";
import { useAppStore } from "@/stores/appStore";
import { sendAddNewPageRequest, type PostRequestDataType } from "@/wordManagement/addNewPageRequest";
import { nextTick, onMounted, ref, useTemplateRef, watch } from "vue";
import PageWithWordsTopBar from "@/NonPageComponents/PageWithWordsTopBar/PageWithWordsTopBar.vue";
import { ViewMode } from "./ViewMode";
import { WordManager } from "@/wordManagement/wordManager";
import { PageType } from "@/wordManagement/PageType";
import { useRoute } from "vue-router";
import { toDashboard } from "@/junk/router";
import { savePageState, loadPageState, clearPageState, PAGE_STATE_KEYS } from "@/junk/pageStateService";
import type { AddPageDraft } from "./addPageDraft";
import { showConfirmationPopup, closeConfirmationPopup } from "@/NonPageComponents/ConfirmationPopup/confirmationPopup";

const appStore = useAppStore()


/* ==================
 * === INITIALIZE ===
 * ================== */
// Multiple choice sayfalari (admin) simdilik sadece raw view ile olusturulur.
const route = useRoute()
const isMultipleChoice = route.query.type === PageType.MULTIPLE_CHOICE

const title = ref(isMultipleChoice ? 'New Multiple Choice' : 'New Page')
const wordObjects = ref([{
    w1: "",
    w1EditMode: false,
    w2: "",
    w2EditMode: false,
}]);
const rawModeString = ref('');
const viewMode = ref(isMultipleChoice ? ViewMode.RAW : ViewMode.STANDARD)
const content = useTemplateRef<HTMLElement>('content')


/* =============
 * === DRAFT ===
 * ============= */
// Tek draft (localStorage). Dashboard menusunden "?draft=1" ile acilinca geri yuklenir.
const draft = route.query.draft ? loadPageState<AddPageDraft>(PAGE_STATE_KEYS.draft, 'local') : null
if (draft) {
    title.value = draft.title
    wordObjects.value = draft.wordObjects.map(w => ({ w1: w.w1, w1EditMode: false, w2: w.w2, w2EditMode: false }))
    rawModeString.value = draft.rawModeString
    viewMode.value = draft.viewMode
}
onMounted(() => {
    if (draft) nextTick().then(() => content.value?.scrollTo(0, draft.scroll))
})

const isEmpty = () => rawModeString.value.trim() === '' && wordObjects.value.every(w => w.w1 === '' && w.w2 === '')

const saveDraft = () => {
    if (isEmpty()) return
    savePageState(PAGE_STATE_KEYS.draft, {
        title: title.value,
        wordObjects: wordObjects.value.map(w => ({ w1: w.w1, w2: w.w2 })),
        rawModeString: rawModeString.value,
        viewMode: viewMode.value,
        type: isMultipleChoice ? PageType.MULTIPLE_CHOICE : PageType.PAGE,
        scroll: content.value?.scrollTop ?? 0,
    } satisfies AddPageDraft, 'local')
}
watch([title, wordObjects, rawModeString, viewMode], saveDraft, { deep: true })

const clearDraft = () => clearPageState(PAGE_STATE_KEYS.draft, 'local')

// Geri: icerik bos ise sormadan cik (draft silinir), degilse sor.
const onBackClick = () => {
    if (isEmpty()) {
        clearDraft()
        toDashboard()
        return
    }
    showConfirmationPopup({
        title: 'Save as draft?',
        buttons: [
            { name: 'Delete', click: () => { closeConfirmationPopup(); clearDraft(); toDashboard() } },
            { name: 'Save', click: () => { closeConfirmationPopup(); saveDraft(); toDashboard() } },
        ],
    })
}

/* ====================
 * === LISTEN INPUT ===
 * ==================== */
const onWordObjectsChanged = () => {
    // Don't do anything if any word is in edit mode
    if (wordObjects.value.some(wObj => wObj.w1EditMode || wObj.w2EditMode)) {
        return
    }
    const items = wordObjects.value
    const withoutLast = items.slice(0, -1)
    const lastItem = items[items.length - 1]
    const emptyRowIndex = withoutLast.findIndex(w => w.w1 === "" && w.w2 === "")
    const allFilled = withoutLast.every(w => w.w1 !== "" || w.w2 !== "")

    if (emptyRowIndex !== -1) {
        const cleaned = withoutLast.filter(w => !(w.w1 === "" && w.w2 === ""))
        wordObjects.value = [
            ...cleaned,
            {
                w1: "",
                w1EditMode: false,
                w2: "",
                w2EditMode: false,
            }
        ]
        return
    }
    if (allFilled && (lastItem && (lastItem.w1 !== "" || lastItem.w2 !== ""))) {
        wordObjects.value = [
            ...items,
            {
                w1: "",
                w1EditMode: false,
                w2: "",
                w2EditMode: false,
            }
        ]
        return
    }
}
watch(
    wordObjects, () => {
        onWordObjectsChanged();
    },
    { deep: true }
)


/* ===============
 * === METHODS ===
 * =============== */
const onViewModeChange = (vm: ViewMode) => {
    if (vm === ViewMode.RAW) {
        rawModeString.value = getRawModeTextFromInputs();
    }
    if (vm === ViewMode.STANDARD) {
        const wordModels = WordManager.instance.setupWords(rawModeString.value);
        const addPageWordObjects = wordModels.map(wm => {
            return {
                w1: wm.pinyin ? `${wm.word} | ${wm.pinyin}` : wm.word,
                w1EditMode: false,
                w2: wm.meaning,
                w2EditMode: false,
            }
        })
        wordObjects.value = addPageWordObjects
        onWordObjectsChanged();
    }
    viewMode.value = vm
}
const getRawModeTextFromInputs = () => {
    // const nonEmptyWordObjects = wordObjects.value.filter(wObj => wObj.w1 !== "" || wObj.w2 !== "");
    const result = wordObjects.value.map(wObj => {
        return [wObj.w1, wObj.w2].join(" | ")
    }).join("\n")
    return result;
}

const onSaveClick = () => {
    let wordsString = "";
    if (viewMode.value === ViewMode.RAW) {
        wordsString = rawModeString.value;
    } else if (viewMode.value === ViewMode.STANDARD) {
        wordsString = getRawModeTextFromInputs();
    }

    console.log(wordObjects.value);
    const requestData = {
        name: title.value,
        description: "no-description-yet",
        words: wordsString,
        type: isMultipleChoice ? PageType.MULTIPLE_CHOICE : PageType.PAGE,
    } as PostRequestDataType;
    sendAddNewPageRequest(requestData).then(async (res) => {
        if (res.success) {
            clearDraft()
            await appStore.loadPages()
            router.push({ name: 'dashboard' })
        }
    })
}

</script>
<style src="./PageAddPage.scss" lang="scss"></style>
