<template>
    <div class="sparkles-component">
        <span v-for="(s, i) in sparkles" :key="i" class="sparkle"
              :style="{
                top: s.top + '%',
                left: s.left + '%',
                width: s.size + 'px',
                height: s.size + 'px',
                animationDelay: s.delay + 's',
                animationDuration: s.duration + 's',
                '--dx': s.dx + 'px',
                '--dy': s.dy + 'px'
            }">
        </span>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { randomInt } from "@/junk/util/utils";



const COUNT = randomInt(10, 16)

// generate random sparkles for THIS button instance
const sparkles = ref(
    Array.from({ length: COUNT }, () => {
        const size = randomInt(3, 7);
        return {
            top: 80 + Math.random() * 20, // start near bottom
            left: Math.random() * 90,     // anywhere horizontally
            delay: +(Math.random() * 4).toFixed(2),
            duration: 5 + Math.random() * 3,
            dx: (Math.random() - 0.5) * 20, // random sideways drift
            dy: -50 - Math.random() * 20,   // random upward drift
            size
        };
    })
);
</script>
<style scoped lang="scss">
.sparkles-component {
    position: absolute;
    left: 5%;
    top: 5%;
    right: 5%;
    bottom: 5%;

    /* sparkle particle */
    .sparkle {
        position: absolute;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        opacity: 0;
        animation-name: sparkleDrift;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
    }

    @keyframes sparkleDrift {
        0% {
            transform: translate(0, 0) scale(0.4);
            opacity: 0;
        }

        20% {
            opacity: 0.4;
        }

        50% {
            transform: translate(var(--dx), calc(var(--dy) / 2)) scale(1);
            opacity: 0.7;
        }

        80% {
            opacity: 0.3;
        }

        100% {
            transform: translate(var(--dx), var(--dy)) scale(0.5);
            opacity: 0;
        }
    }
}
</style>