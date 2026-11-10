<template>
    <div class="top-bar">
        <div class="top-bar-inner-container">
            <div class="left" :class="{ pointer: !backDisabled && !hideBack, 'disabled-back': backDisabled }" @click="handleBack">
                <SvgX v-if="!hideBack" url="/main/src/frontend/assets/svg/left-arrow.svg" :width="24" :height="24" />
            </div>
            <div class="middle">
                <div class="middle-left header1">
                    <!-- Genislik JS ile en uzun satira daraltilir: baslik 2 satira kirilinca kalem
                         bos alanin sonuna degil, en uzun satirin sagina gelir. -->
                    <div v-if="!editTitleMode" ref="title-box" :class="{pointer: titleAdjustable}" @click="onTitleClick"
                         :style="{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }"><span ref="title-text">{{ props.title }}</span></div>
                    <textarea v-else
                              ref="title-input"
                              :style="`width: ${title.length + 2}ch`"
                              @blur="onTitleFocusOut"
                              @keydown.enter.prevent="titleInput?.blur()"
                              :value="props.title"
                              @input="emit('update:title', $event.target.value)" />
                </div>

                <div v-if="titleAdjustable && !editTitleMode" class="middle-right pointer" @click="onTitleClick">
                    <SvgX url="/main/src/frontend/assets/svg/pencil.svg" :width="11" :height="11"
                          style="transform: translateY(1px);" />
                </div>
            </div>
            <div class="right">
                <slot name="right">

                </slot>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { toDashboard } from '@/junk/router';
import router from '@/router';
import { nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch, type PropType } from 'vue';

const props = defineProps({
    title: {
        type: String,
        required: true
    },
    titleAdjustable: {
        type: Boolean,
        default: false
    },
    backDisabled: {
        type: Boolean,
        default: false
    },
    // Edit modunda cikis sadece Cancel ile; ok hic gosterilmez (yeri korunur, baslik kaymaz).
    hideBack: {
        type: Boolean,
        default: false
    },
    backHandler: {
        type: Function as PropType<() => void>,
        default: undefined,
    },
})
const emit = defineEmits(['update:title', 'commit:title'])

const handleBack = () => {
    if (props.backDisabled || props.hideBack) return
    if (props.backHandler) {
        props.backHandler()
    } else {
        toDashboard()
    }
}


const editTitleMode = ref(false)
const titleInput = useTemplateRef('title-input')

const onTitleClick = () => {
    if (!props.titleAdjustable) {
        return;
    }
    editTitleMode.value = true;
    nextTick().then(() => {
        titleInput.value?.focus()
    })
}
const onTitleFocusOut = () => {
    editTitleMode.value = false
    emit('commit:title')
}

// Baslik kutusunu en uzun satirin genisligine daralt (CSS kirilan kutuyu kucultmez).
const titleBox = useTemplateRef<HTMLElement>('title-box')
const titleText = useTemplateRef<HTMLElement>('title-text')

// Senkron olcum: once genislik serbest birakilir, ayni karede olculup yeniden yazilir.
// (Eski async surum ust uste cagrilinca daraltilmis kutuyu tekrar olcup baslig 3 satira bolebiliyordu.)
const fitTitle = () => nextTick(() => {
    const box = titleBox.value, text = titleText.value
    if (!box || !text) return
    box.style.width = ''
    const lines = [...text.getClientRects()]
    // +1px: alt piksel yuvarlamasi yuzunden son kelime alt satira dusmesin.
    if (lines.length <= 1) return
    // border-box'ta width padding'i de icerir; padding eklenmezse icerik daralir ve 3 satira bolunur.
    const cs = getComputedStyle(box)
    const pad = cs.boxSizing === 'border-box' ? parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) : 0
    box.style.width = `${Math.ceil(Math.max(...lines.map(r => r.width)) + pad) + 1}px`
})

watch([() => props.title, editTitleMode], fitTitle)
onMounted(() => {
    fitTitle()
    document.fonts?.ready.then(fitTitle)
    window.addEventListener('resize', fitTitle)
})
onBeforeUnmount(() => window.removeEventListener('resize', fitTitle))

</script>