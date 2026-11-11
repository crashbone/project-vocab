<template>
    <!-- ‹ n / N ›  Clicking the counter turns only n into an input; Enter/blur navigates, Escape cancels. -->
    <div class="question-nav" :class="{ inactive: disabled }">
        <div class="nav-button pointer" :class="{ disabled: disabled || index <= 0 }" @click="go(index - 1)">
            <SvgX url="/main/src/frontend/assets/svg/left-arrow.svg" :width="20" :height="20" />
        </div>
        <div class="progress" :class="{ pointer: !disabled }" :style="{ minWidth: `${digits * 2 + 3}ch` }"
             @click="startEdit">
            <input v-if="editing" ref="input" type="text" inputmode="numeric"
                   class="progress-input" :style="{ width: `${digits + 1}ch` }"
                   v-model="inputValue"
                   @click.stop
                   @keydown.enter.prevent="($event.target as HTMLInputElement).blur()"
                   @keydown.escape.prevent="editing = false"
                   @blur="commitEdit" />
            <span v-else>{{ index + 1 }}</span>
            <span>&nbsp;/ {{ total }}</span>
        </div>
        <div class="nav-button pointer" :class="{ disabled: disabled || index >= lastIndex }" @click="go(index + 1)">
            <SvgX url="/main/src/frontend/assets/svg/right-arrow.svg" :width="20" :height="20" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef } from 'vue'

// allowNew: can go forward past the last question (index = total, new empty question; edit mode).
const props = defineProps<{ index: number, total: number, disabled?: boolean, allowNew?: boolean }>()
const emit = defineEmits<{ go: [index: number] }>()

const lastIndex = computed(() => props.allowNew ? props.total : props.total - 1)
const digits = computed(() => String(props.total).length)
const editing = ref(false)
const inputValue = ref('')
const input = useTemplateRef<HTMLInputElement>('input')

const go = (i: number) => {
    if (props.disabled || i < 0 || i > lastIndex.value) return
    emit('go', i)
}

const startEdit = () => {
    if (props.disabled || editing.value) return
    inputValue.value = String(props.index + 1)
    editing.value = true
    nextTick(() => input.value?.select())
}

const commitEdit = () => {
    if (!editing.value) return
    editing.value = false
    const n = Number.parseInt(inputValue.value)
    if (!Number.isNaN(n)) go(Math.min(Math.max(n, 1), props.total) - 1)
}
</script>

<style lang="scss">
.question-nav {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;

    .progress {
        display: flex;
        justify-content: center;
        align-items: center;
        color: $color-lilac-700;
        font-size: $font-size-small;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;

        .progress-input {
            display: inline-block;
            text-align: center;
            border-radius: 4px;
        }
    }

    .nav-button {
        display: flex;
        align-items: center;
        padding: 4px;
        color: $color-lilac-700;
        user-select: none;

        &.disabled {
            opacity: 0.3;
            pointer-events: none;
        }
    }
}
</style>
