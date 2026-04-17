<template>
    <div class="app-frame page add_page">
        <!-- TOP BAR -->
        <PageWithWordsTopBar
                             :title="title"
                             :titleAdjustable="true"
                             @update:title="title = $event">
            <template v-if="viewMode === ViewMode.RAW" #right>
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
        <div v-if="viewMode === ViewMode.STANDARD" class="page-content-container-1">
            <template v-for="(word, index) in wordObjects" :key="index">
                <div class="row">
                    <ButtonX class="size80px" :class="{ 'edit-mode': word.w1EditMode }" :index="index"
                             @click="onWordClick(index, 1)">
                        <div class="button-content2">
                            <div class="text" :class="{placeholder: !word.w1}">
                                <div v-show="!word.w1EditMode">{{ word.w1 || 'tap to add' }}</div>
                                <textarea v-show="word.w1EditMode" ref="wordInputs1"
                                          @blur="onWordFocusOut(index, 1)" type="text" size='' v-model="word.w1" />
                            </div>
                            <div class="bullets">
                                <div class="bullet" v-for="i in 2" :key="i"
                                     :class="{ active: i === 1 }"></div>
                            </div>
                        </div>
                    </ButtonX>
                    <ButtonX class="size80px" :class="{ 'edit-mode': word.w2EditMode }" :index="index"
                             @click="onWordClick(index, 2)">
                        <div class="button-content2">
                            <div class="text" :class="{placeholder: !word.w2}">
                                <div v-show="!word.w2EditMode">{{ word.w2 || 'tap to add' }}</div>
                                <textarea v-show="word.w2EditMode" ref="wordInputs2"
                                          @blur="onWordFocusOut(index, 2)" type="text" size='' v-model="word.w2" />
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

        <!-- CONTENT: Raw -->
        <div v-else-if="viewMode === ViewMode.RAW" class="page-content-container-1">
            <textarea v-model="rawModeString" class="raw-mode" />
        </div>

        <div class="bottom-bar">
            <LiquidGlass class="bottom-bar-liquid-glass pointer" :class="`block${index1 + 1}`" v-for="(objList, index1) in bottomBarButtons" :key="index1">
                <div class="liquid-glass-card-slot-content">
                    <div class="bottom-bar-button" @click="obj.click" v-for="(obj, index2) in objList" :key="index2">
                        <transition name="modeSwitch-scale">
                            <div v-if="obj.active?.()" class="animation-overlay"></div>
                        </transition>
                        <div class="bottom-bar-button-top">
                            <SvgX :url="`/main/src/frontend/assets/svg/${obj.icon}.svg`" :width="obj.size" :height="obj.size"
                                  :style="obj.style || ''" />
                        </div>
                        <div class="bottom-bar-button-bottom">{{ obj.name }}</div>
                    </div>
                </div>
            </LiquidGlass>

        </div>
    </div>
</template>
<script setup lang="ts">
import router from "@/router";
import { useAppStore } from "@/stores/appStore";
import { sendAddNewPageRequest, type PostRequestDataType } from "@/wordManagement/addNewPageRequest";
import { computed, nextTick, ref, watch, type Ref } from "vue";
import PageWithWordsTopBar from "@/NonPageComponents/PageWithWordsTopBar/PageWithWordsTopBar.vue";
import { ViewMode } from "./ViewMode";
import { WordManager } from "@/wordManagement/wordManager";

const appStore = useAppStore()


/* ==================
 * === INITIALIZE ===
 * ================== */
type BottomBarObj = {
    icon: string,
    name: string,
    style: string,
    size: number,
    click?: () => void,
    active?: () => boolean
}


const title = ref('New Page')
const wordObjects = ref([{
    w1: "",
    w1EditMode: false,
    w2: "",
    w2EditMode: false,
}]);
const wordInputs1: Ref<HTMLElement[]> = ref([]);
const wordInputs2: Ref<HTMLElement[]> = ref([]);
const rawModeString = ref('');
const viewMode = ref(ViewMode.STANDARD)

const bottomBarButtons = computed((): BottomBarObj[][] => {
    return [
        [],  // empty block1 (no cancel in addPage)
        [
            {
                icon: 'export',
                name: 'Standard View',
                style: 'transform: translateY(-3px)',
                size: 18,
                click: () => onViewModeChange(ViewMode.STANDARD),
                active: () => viewMode.value === ViewMode.STANDARD
            },
            {
                icon: 'export',
                name: 'Raw View',
                style: 'transform: translateY(-3px)',
                size: 18,
                click: () => onViewModeChange(ViewMode.RAW),
                active: () => viewMode.value === ViewMode.RAW
            }
        ],
        [
            {
                icon: 'export',
                name: 'Save',
                style: 'transform: translateY(-3px)',
                size: 18,
                click: onSaveClick,
            }
        ],
    ]
})


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
const onWordClick = (i: number, wi: number) => {
    const word = wordObjects.value[i];
    if (wi === 2) {
        word.w2EditMode = true
    } else {
        word.w1EditMode = true
    }
    nextTick().then(() => {
        console.log(wordInputs1.value, wordInputs2.value)
        if (wi === 2) {
            wordInputs2.value[i]?.focus()
            return
        }
        if (wi === 1) {
            wordInputs1.value[i]?.focus()
            return
        }
    })
}

const onWordFocusOut = (i: number, wi: number) => {
    const word = wordObjects.value[i];
    if (wi === 2) {
        word.w2EditMode = false
    } else {
        word.w1EditMode = false
    }
}
const onViewModeChange = (vm: ViewMode) => {
    if (vm === ViewMode.RAW) {
        rawModeString.value = getRawModeTextFromInputs();
    }
    if (vm === ViewMode.STANDARD) {
        const wordModels = WordManager.instance.setupWords(rawModeString.value);
        const addPageWordObjects = wordModels.map(wm => {
            return {
                w1: wm.word,
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
        words: wordsString
    } as PostRequestDataType;
    sendAddNewPageRequest(requestData).then(async (res) => {
        if (res.success) {
            await appStore.loadPages()
            router.push({ name: 'dashboard' })
        }
    })
}

</script>
<style src="./PageAddPage.scss" lang="scss"></style>
