<template>
    <!-- Bottom bar pill. Without `items` a single button (icon / label / active), with `items` a multi-option group. -->
    <LiquidGlass class="bottom-bar-liquid-glass" :class="items ? 'bottom-bar-group' : 'bottom-bar-single'">
        <div class="liquid-glass-card-slot-content">
            <div v-for="(item, i) in list" :key="i" class="bottom-bar-button pointer"
                 :class="{ 'text-only': !item.icon, 'slot-hidden': item.hidden, disabled: item.disabled }"
                 @click="item.click?.($event)">
                <transition name="modeSwitch-scale">
                    <div v-if="item.active" class="animation-overlay"></div>
                </transition>
                <div v-if="item.icon" class="bottom-bar-button-top">
                    <SvgX :url="`/main/src/frontend/assets/svg/${item.icon}.svg`"
                          :width="item.iconSize ?? 18" :height="item.iconSize ?? 18" />
                </div>
                <div v-if="item.label" class="bottom-bar-button-bottom">{{ item.label }}</div>
            </div>
        </div>
    </LiquidGlass>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export type BottomBarItem = {
    icon?: string
    iconSize?: number
    label?: string
    active?: boolean
    // Keeps its slot but is invisible and not clickable (fixed positions across bar states).
    hidden?: boolean
    disabled?: boolean
    click?: (e: Event) => void
}

const props = defineProps<BottomBarItem & { items?: BottomBarItem[] }>()

// A single button uses the same template; the click binds to the root LiquidGlass (fallthrough).
const list = computed((): BottomBarItem[] => {
    if (props.items) return props.items
    return props.icon || props.label ? [{ icon: props.icon, iconSize: props.iconSize, label: props.label, active: props.active }] : []
})
</script>

<style lang="scss">
// Cancel / view picker / Save style bottom bar (PageWords edit, PageAddPage, MultipleChoice).
// Single copy here because page styles are lazy loaded.
.page .bottom-bar.edit-bottom-bar {
  display: flex;
  justify-content: space-evenly;
  padding-inline: 12px;
  width: auto !important;
  margin: auto;
  --border-radius: 32px;

  .liquid-glass-card-slot-content {
    padding: 0;
  }

  .bottom-bar-single .liquid-glass-card-slot-content {
    width: 60px;
  }

  .bottom-bar-group .liquid-glass-card-slot-content {
    padding-inline: 16px;
    gap: 10px;
  }

  // Fixed-width, evenly spread group: same as the PageWords main bar (Export / Shuffle / Toggle All).
  .bottom-bar-group.spread .liquid-glass-card-slot-content {
    width: 270px;
    padding-inline: 0;
    gap: 0;
  }

  // Equal-width slots: the n-th item sits at the same x in every spread bar with n items.
  .bottom-bar-group.spread .bottom-bar-button {
    flex: 1 1 0;
  }

  .bottom-bar-button.slot-hidden {
    visibility: hidden;
    pointer-events: none;
  }

  .bottom-bar-button.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  // All pills have the same height (equal to an icon + label button), including those without icon / label.
  .bottom-bar-button {
    position: relative;
    height: auto;
    min-height: 61px;
    padding: 12px 0;
    justify-content: center;
    align-items: center;

    .animation-overlay {
      position: absolute;
      background-color: rgba(0, 0, 0, 0.06);
      top: 3px;
      bottom: 3px;
      left: -10px;
      right: -10px;
      border-radius: 30px;
    }
  }

  // Icon-less (text only) group options: with short text the overlay looked like a circle.
  // Horizontal padding makes the overlay a horizontal pill like in Standard View; it replaces the gap.
  .bottom-bar-group .liquid-glass-card-slot-content:has(> .text-only) {
    gap: 0;
  }

  // Icon-less options are shorter by the icon row: 44px instead of 61px.
  .bottom-bar-button.text-only {
    padding-inline: 12px;
    padding-block: 0;
    min-height: 44px;

    .animation-overlay {
      left: 0;
      right: 0;
    }
  }

  // On a round single button the overlay must not overflow: keep it inside the circle.
  .bottom-bar-single {
    .liquid-glass-card-slot-content {
      position: relative;
    }

    .bottom-bar-button {
      position: static;
    }

    .animation-overlay {
      inset: 4px;
      border-radius: 50%;
    }
  }
}
</style>
