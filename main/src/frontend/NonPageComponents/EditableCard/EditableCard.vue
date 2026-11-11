<template>
    <!-- Card that turns into a textarea on click (edit modes). Focuses when opened, closes on blur. -->
    <ButtonX class="size80px editable-card" :class="{ 'edit-mode': editing }" :index="index"
             :shining_border_animation="false" @click="emit('update:editing', true)">
        <div class="button-content2">
            <div class="text" :class="{ placeholder: !modelValue }">
                <div v-if="!editing">{{ modelValue || 'tap to add' }}</div>
                <textarea v-else ref="textarea" :value="modelValue"
                          @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
                          @blur="emit('update:editing', false)" />
            </div>
            <slot />
        </div>
    </ButtonX>
</template>

<script setup lang="ts">
import { nextTick, useTemplateRef, watch } from 'vue'

const props = defineProps<{ modelValue: string, editing: boolean, index: number }>()
const emit = defineEmits<{ 'update:modelValue': [value: string], 'update:editing': [value: boolean] }>()

const textarea = useTemplateRef<HTMLTextAreaElement>('textarea')
watch(() => props.editing, (e) => { if (e) nextTick(() => textarea.value?.focus()) }, { immediate: true })
</script>

<style lang="scss">
.page .button.editable-card {
  .text.placeholder {
    opacity: 0.7;
    font-weight: 400;
  }

  .sparkles-component {
    display: none;
  }
}
</style>
