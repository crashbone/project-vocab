@ -1,210 +0,0 @@
<!-- 
How is this file created:
    1. https://www.liquid-glass.pro
    2. Generator
    3. Copy: HTML + CSS Code to this file
    4. Convert to .vue code
-->
<template>
    <div class="liquid-glass-component">
        <div class="liquid-glass">
            <div class="liquid-glass-content">
                <slot></slot>
            </div>
        </div>

        <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
            <defs>
                <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%">
                    <feTurbulence type="fractalNoise" :baseFrequency="`${distortionFrequency} ${distortionFrequency}`"
                                  numOctaves="2" seed="92"
                                  result="noise" />
                    <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
                    <feDisplacementMap in="SourceGraphic" in2="blurred" :scale="displacementScale" xChannelSelector="R"
                                       yChannelSelector="G" />
                </filter>
            </defs>
        </svg>
    </div>
</template>

<script setup lang="ts">
const distortionFrequency = "0.006"
const displacementScale = "100"


</script>


<style scoped lang="scss">
.liquid-glass-component {
    position: relative;
}

/* NOT SASS, CSS */
.liquid-glass {
    border-radius: var(--border-radius);
    position: relative;
    isolation: isolate;
    // box-shadow: 0px 3px 12px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    padding: 0;
    margin: 0;

    &:focus {
        outline: none;
    }

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 0;
        border-radius: var(--border-radius);
    }

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        z-index: -1;
        border-radius: var(--border-radius);
        backdrop-filter: var(--backdrop-filter, blur(5px));
        -webkit-backdrop-filter: var(--backdrop-filter, blur(5px));
        filter: url(#glass-distortion);
        -webkit-filter: url(#glass-distortion);
    }

    .liquid-glass-content {
        position: relative;
        z-index: 2;
    }
}

.liquid-glass-component.bubble {
    --rand-delay: 0s;
    --duration: 6.0s;
    /* default, overridden in JS */
    animation: bubble-anim var(--duration) ease-out infinite;
    animation-delay: var(--rand-delay);
}
</style>