<template>
    <div class="top-bar">
        <div class="top-bar-inner-container">
            <div class="left" :class="{ pointer: !backDisabled, 'disabled-back': backDisabled }" @click="handleBack">
                <SvgX url="/main/src/frontend/assets/svg/left-arrow.svg" :width="24" :height="24" />
            </div>
            <div class="middle">
                <div class="middle-left header1">
                    <div v-if="!editTitleMode" :class="{pointer: titleAdjustable}" @click="onTitleClick"
                         style="white-space: pre-wrap; word-wrap: break-word;">{{ props.title }}</div>
                    <textarea v-else
                              ref="title-input"
                              :style="`width: ${title.length + 2}ch`"
                              @blur="onTitleFocusOut"
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
import { nextTick, ref, useTemplateRef, type PropType } from 'vue';

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
    backHandler: {
        type: Function as PropType<() => void>,
        default: undefined,
    },
})
const emit = defineEmits(['update:title'])

const handleBack = () => {
    if (props.backDisabled) return
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
}

</script>