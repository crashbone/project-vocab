<template>
    <div class="app-frame page add_page" :class="{ 'mc-quiz': isMultipleChoice }">
        <!-- TOP BAR -->
        <PageWithWordsTopBar
                             :title="title"
                             :titleAdjustable="true"
                             :backHandler="onBackClick"
                             @update:title="title = $event">
            <template v-if="isMultipleChoice && viewMode === ViewMode.RAW" #right>
                <SvgX v-tooltip="mcHelpTooltip" class="pointer" url="/main/src/frontend/assets/svg/question.svg" :width="31" :height="31" />
            </template>
            <template v-else-if="!isMultipleChoice && viewMode === ViewMode.RAW" #right>
                <SvgX v-tooltip="wordsHelpTooltip" class="pointer" url="/main/src/frontend/assets/svg/question.svg" :width="31" :height="31" />
            </template>
        </PageWithWordsTopBar>

        <!----------------------------------------------------------------->
        <!---------------------------- CONTENT ---------------------------->
        <!----------------------------------------------------------------->

        <!-- CONTENT: Multiple choice (same editor as PageMultipleChoice edit mode) -->
        <MultipleChoiceEditor v-if="isMultipleChoice" ref="mcEditor" v-model="rawModeString"
                              :rawView="viewMode === ViewMode.RAW"
                              @update:rawView="viewMode = $event ? ViewMode.RAW : ViewMode.STANDARD" />

        <!-- CONTENT: Standard -->
        <div v-else-if="viewMode === ViewMode.STANDARD" ref="content" class="page-content-container-1" @scroll="saveDraft">
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
            <!-- Empty left block (AddPage has no Cancel): keeps Save on the right. -->
            <BottomBarButton />
            <BottomBarButton :items="[
                { icon: 'export', label: 'Standard View', active: viewMode === ViewMode.STANDARD, click: () => onViewModeChange(ViewMode.STANDARD) },
                { icon: 'export', label: 'Raw View', active: viewMode === ViewMode.RAW, click: () => onViewModeChange(ViewMode.RAW) },
            ]" />
            <BottomBarButton icon="export" label="Save" :class="{ disabled: mcInvalid }" @click="onSaveClick" />
        </div>
    </div>
</template>
<script setup lang="ts">
import router from "@/router";
import { useAppStore } from "@/stores/appStore";
import { sendAddNewPageRequest, type PostRequestDataType } from "@/wordManagement/addNewPageRequest";
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from "vue";
import PageWithWordsTopBar from "@/NonPageComponents/PageWithWordsTopBar/PageWithWordsTopBar.vue";
import { ViewMode } from "./ViewMode";
import MultipleChoiceEditor from "@/NonPageComponents/MultipleChoiceEditor/MultipleChoiceEditor.vue";
import { MULTIPLE_CHOICE_HELP_TOOLTIP } from "@/NonPageComponents/MultipleChoiceEditor/multipleChoiceHelp";
import { WORDS_RAW_HELP_TOOLTIP } from "@/wordManagement/wordsHelp";
import { useHelpTooltip, prependExample } from "@/composables/useHelpTooltip";
import { WordManager, type WordRow } from "@/wordManagement/wordManager";
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
// Multiple choice pages use MultipleChoiceEditor; rawModeString holds their text in both views.
const route = useRoute()
const isMultipleChoice = route.query.type === PageType.MULTIPLE_CHOICE

const title = ref(isMultipleChoice ? 'New Multiple Choice' : 'New Page')
const wordObjects = ref<WordRow[]>([{
    w1: "",
    w1EditMode: false,
    w2: "",
    w2EditMode: false,
}]);
const rawModeString = ref('');
const mcEditor = useTemplateRef<InstanceType<typeof MultipleChoiceEditor>>('mcEditor')
const wordsHelpTooltip = useHelpTooltip(WORDS_RAW_HELP_TOOLTIP, rawModeString,
    (example) => { rawModeString.value = prependExample(rawModeString.value, example) })
const mcHelpTooltip = useHelpTooltip(MULTIPLE_CHOICE_HELP_TOOLTIP, rawModeString,
    (example) => mcEditor.value?.prependText(example))
const viewMode = ref(ViewMode.STANDARD)
const content = useTemplateRef<HTMLElement>('content')


/* =============
 * === DRAFT ===
 * ============= */
// Single draft (localStorage). Restored when opened from the dashboard menu with "?draft=1".
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

// Back: if content is empty leave without asking (draft is deleted), otherwise ask.
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
    // MultipleChoiceEditor converts between its views itself.
    if (isMultipleChoice) {
        viewMode.value = vm
        return
    }
    if (vm === ViewMode.RAW) {
        rawModeString.value = getRawModeTextFromInputs();
    }
    if (vm === ViewMode.STANDARD) {
        wordObjects.value = WordManager.instance.setupWordRows(rawModeString.value)
        onWordObjectsChanged();
    }
    viewMode.value = vm
}
// Unchanged rows keep the user's source line; empty rows are not written.
const getRawModeTextFromInputs = () => WordManager.instance.formatWordRows(wordObjects.value)

// Multiple choice: save is blocked while any line is invalid or there is no question.
const mcInvalid = computed(() => isMultipleChoice && (rawModeString.value.trim() === ''
    || WordManager.instance.validateMultipleChoice(rawModeString.value).length > 0))

const onSaveClick = () => {
    if (mcInvalid.value) return
    let wordsString = "";
    if (isMultipleChoice || viewMode.value === ViewMode.RAW) {
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
