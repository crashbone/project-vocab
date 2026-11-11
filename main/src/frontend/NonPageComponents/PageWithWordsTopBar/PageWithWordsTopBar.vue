<template>
    <div class="top-bar">
        <div class="top-bar-inner-container">
            <div class="left" :class="{ pointer: !backDisabled && !hideBack, 'disabled-back': backDisabled }" @click="handleBack">
                <SvgX v-if="!hideBack" url="/main/src/frontend/assets/svg/left-arrow.svg" :width="24" :height="24" />
            </div>
            <div class="middle">
                <div class="middle-left header1">
                    <!-- Width is shrunk by JS to the longest line: when the title wraps to 2 lines the pencil
                         sits right of the longest line, not at the end of the empty space. -->
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
    // In edit mode exit only via Cancel; the arrow is hidden (its space is kept, the title does not shift).
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

// Shrink the title box to the width of its longest line (CSS does not shrink a wrapped box).
const titleBox = useTemplateRef<HTMLElement>('title-box')
const titleText = useTemplateRef<HTMLElement>('title-text')

// Synchronous measurement: width is released first, then measured and set again in the same frame.
// (The old async version, when called repeatedly, re-measured the shrunk box and could split the title into 3 lines.)
const fitTitle = () => nextTick(() => {
    const box = titleBox.value, text = titleText.value
    if (!box || !text) return
    box.style.width = ''
    const lines = [...text.getClientRects()]
    // +1px: so subpixel rounding does not push the last word to the next line.
    if (lines.length <= 1) return
    // With border-box the width includes padding; without adding padding the content shrinks and wraps to 3 lines.
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