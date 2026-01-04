<template>
    <div v-if="!page"></div>
    <div else class="app-frame page words">
        <!-- TOP BAR -->
        <PageWithWordsTopBar
                             :title="title"
                             @update:title="title = $event">
            <template #right>
                <SvgX class="pointer" url="/main/src/assets/svg/check.svg" :width="28" :height="28" />
                <div class="pointer profile-icon">C</div>
            </template>
        </PageWithWordsTopBar>

        <!-- CONTENT -->
        <div v-if="page" class="page-content-container-1">
            <template v-for="(word, index) in page!.wordModels" :key="index">
                <ButtonX @click="wordClick(index)"
                         @dblclick="wordDblClick(index)"
                         :shining_border_animation="word.marker"
                         class="size80px" :class="`wordMode${word.mode}`"
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

        <div class="bottom-bar" style="width: 200px">
            <LiquidGlass class="bottom-bar-liquid-glass">
                <div class="liquid-glass-card-slot-content">
                    <div class="bottom-bar-button pointer" v-for="(obj, index) in [
                        // {
                        //     icon: 'export',
                        //     name: 'Export',
                        //     style: 'transform: translateY(1px)',
                        //     size: 18,
                        // },
                        {
                            icon: 'shuffle',
                            name: 'Shuffle',
                            size: 20,
                            click: shuffleClick,

                        },
                        {
                            icon: 'toggle-all',
                            name: 'Toggle All',
                            style: 'transform: translateY(2px)',
                            size: 17,
                            click: toggleClick,
                        },
                        // {
                        //     icon: 'appearance',
                        //     name: 'Appearance',
                        //     style: 'transform: translateY(1px)',
                        //     size: 19,
                        // }
                    ]" :key="index" @click="obj.click">
                        <div class="bottom-bar-button-top">
                            <SvgX :url="`/main/src/assets/svg/${obj.icon}.svg`" :width="obj.size" :height="obj.size"
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
import { type Ref, ref, onMounted, onBeforeUnmount } from "vue";
import { globalData } from '@/junk/globalData'
import { PageModel } from "@/wordManagement/PageModel";
import { TimeSpentHandler } from "@/junk/TimeSpentHandler";
import { enumLength } from "@/junk/util/enumLength"
import { WordMode } from "@/wordManagement/WordMode"
import { dynamicHeightSetUtil } from "@/junk/dynamicHeightSetUtil";
import { toDashboard } from "@/junk/router";
import { shuffle } from "@/junk/util/shuffle";
import { subscribe } from "@/junk/EventBus";
// import { routerToDashboard } from "@/junk/router";

/* ==================
 * === INITIALIZE ===
 * ================== */

const title = ref('');
const wordRefs = ref([]);
const props = defineProps({
    pageId: String, // it has to be string, because url param
})

onMounted(() => {
    setTimeout(() => {
        if (!globalData.dashboardModel) {
            // 5 seconds and still no data
            toDashboard();
            return;
        }
    }, 5000);
    onStartRecording();
})

onBeforeUnmount(() => {
    onStopRecording()
})
const grabPage = (): PageModel | undefined => {
    if (!props.pageId || !globalData.dashboardModel) {
        return undefined;
    }
    const pageId = Number.parseInt(props.pageId) || 0;
    return globalData.dashboardModel.pageModelMap![pageId]
}
const page: Ref<PageModel | undefined> = ref(grabPage());

const onPageGrabbed = () => {
    if (!page.value) {
        return;
    }
    title.value = page.value.name
}

if (page.value) {
    onPageGrabbed();
}

subscribe('pagesFetched', () => {
    console.log('pagesFetched')
    page.value = grabPage();
    console.log(page.value);
    onPageGrabbed();
})


/* ===============
 * === METHODS ===
 * =============== */

const wordClick = async (i: number) => {
    const el = wordRefs.value[i] as HTMLElement;
    dynamicHeightSetUtil(el, () => { nextMode(i) });
}

const wordDblClick = (i: number) => {
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