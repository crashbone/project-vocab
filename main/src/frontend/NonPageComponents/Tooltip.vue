<template>
  <div ref="triggerEl" class="tooltip-trigger"
    @mouseenter="show" @mouseleave="hide"
    @focus="show" @blur="hide">
    <slot />
  </div>

  <!-- Tooltip is teleported to body to avoid overflow/clipping -->
  <teleport to="body">
    <transition name="fade">
      <div v-if="visible" ref="tooltipEl" class="tooltip-box" :style="tooltipStyle">
        <slot name="content" />
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from "vue";

const props = defineProps({
  placement: {
    type: String,
    default: "top", // top, bottom, left, right
  },
  offset: {
    type: Number,
    default: 8,
  },
});

const triggerEl = ref(null);
const tooltipEl = ref(null);
const visible = ref(false);
const tooltipStyle = reactive({
  position: "absolute",
  top: "0px",
  left: "0px",
});

function updatePosition() {
  if (!triggerEl.value || !tooltipEl.value) return;

  const trigger = triggerEl.value.getBoundingClientRect();
  const tooltip = tooltipEl.value.getBoundingClientRect();

  let top = 0;
  let left = 0;

  switch (props.placement) {
    case "top":
      top = trigger.top - tooltip.height - props.offset;
      left = trigger.left + trigger.width / 2 - tooltip.width / 2;
      break;

    case "bottom":
      top = trigger.bottom + props.offset;
      left = trigger.left + trigger.width / 2 - tooltip.width / 2;
      break;

    case "left":
      top = trigger.top + trigger.height / 2 - tooltip.height / 2;
      left = trigger.left - tooltip.width - props.offset;
      break;

    case "right":
      top = trigger.top + trigger.height / 2 - tooltip.height / 2;
      left = trigger.right + props.offset;
      break;
  }

  tooltipStyle.top = `${top + window.scrollY}px`;
  tooltipStyle.left = `${left + window.scrollX}px`;
}

function show() {
  visible.value = true;
  nextTick(updatePosition);
}

function hide() {
  visible.value = false;
}

onMounted(() => {
  window.addEventListener("resize", updatePosition);
  window.addEventListener("scroll", updatePosition, true);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updatePosition);
  window.removeEventListener("scroll", updatePosition, true);
});
</script>

<style scoped>
.tooltip-trigger {
  display: inline-block;
  position: relative;
}

.tooltip-box {
  background: #333;
  color: white;
  padding: 8px 12px;
  font-size: 0.875rem;
  border-radius: 6px;
  white-space: nowrap;
  z-index: 9999;
  pointer-events: none;
  position: absolute;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
