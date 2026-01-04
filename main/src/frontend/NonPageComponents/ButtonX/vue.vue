<template>
    <div :class="[`button type${((index % 3) + 1)}`, { shining_border_brightness_animation: shining_border_animation }]" :style="`--rand-delay: ${index * 3 + 3 % 5}s`">
        <div v-if="shining_border_animation" class="shining_border"></div>
        <div class="bubble_effect"></div>
        <Sparkles />
        <div class="button-content">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    index: number,
    shining_border_animation: boolean
}>()

</script>
<style src="./scss.scss" lang="scss"></style>