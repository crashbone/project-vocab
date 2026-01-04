<template>
    <div :filename="fileName" class="svgx" v-html="svgContent" :style="containerStyle"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'

const props = defineProps({
    url: String,
    width: Number,
    height: Number,
})

const svgContent = ref('')

const containerStyle = computed(() => ({
    width: `${props.width}px`,
    height: `${props.height}px`
}))

const fileName = computed(() => props.url?.split('/')?.pop())

async function loadSvg() {
    svgContent.value = '<!-- Loading... -->'
    try {
        if (!props.url) return
        const response = await fetch(props.url)
        if (!response.ok) {
            throw new Error(`Failed to load SVG: ${response.statusText}`)
        }


        svgContent.value = (await response.text()).replace(/\s(width|height)="[^"]*"/ig, '')
    } catch (err) {
        // @ts-expect-error error
        svgContent.value = `<!-- SVG load failed: ${err.message || 'Check URL and CORS'} -->`
    }
}

onMounted(loadSvg)
watch(() => props.url, loadSvg)
</script>

<style lang="scss">
.svgx {
    display: inline-flex;
    flex-shrink: 0;

    svg {
        width: 100%;
        height: 100%;
        fill: currentColor;
        display: block;
    }
}
</style>