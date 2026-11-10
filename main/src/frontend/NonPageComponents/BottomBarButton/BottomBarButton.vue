<template>
    <!-- Alt bar pill'i. `items` verilmezse tek buton (icon / label / active), verilirse coklu secenek (grup). -->
    <LiquidGlass class="bottom-bar-liquid-glass" :class="items ? 'bottom-bar-group' : 'bottom-bar-single'">
        <div class="liquid-glass-card-slot-content">
            <div v-for="(item, i) in list" :key="i" class="bottom-bar-button pointer"
                 :class="{ 'text-only': !item.icon }" @click="item.click?.($event)">
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
    click?: (e: Event) => void
}

const props = defineProps<BottomBarItem & { items?: BottomBarItem[] }>()

// Tek buton da ayni sablonla cizilir; tiklama kok LiquidGlass'a (fallthrough) baglanir.
const list = computed((): BottomBarItem[] => {
    if (props.items) return props.items
    return props.icon || props.label ? [{ icon: props.icon, iconSize: props.iconSize, label: props.label, active: props.active }] : []
})
</script>

<style lang="scss">
// Cancel / gorunum secici / Save tipi alt bar (PageWords edit, PageAddPage, MultipleChoice).
// Sayfa stilleri lazy yuklendigi icin tek kopya burada.
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

  // Tum pill'ler ayni yukseklikte (ikon + etiketli butonla esit): ikonsuz / etiketsizler de.
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

  // Ikonsuz (sadece yazi) grup secenekleri: yazi kisa oldugu icin overlay daire gibi kaliyordu.
  // Yatay ic bosluk overlay'i Standard View'daki gibi yatay pill yapar; aradaki gap'in yerini tutar.
  .bottom-bar-group .liquid-glass-card-slot-content:has(> .text-only) {
    gap: 0;
  }

  // Ikonsuz secenekler ikon satiri kadar alcak: 61px yerine 44px.
  .bottom-bar-button.text-only {
    padding-inline: 12px;
    padding-block: 0;
    min-height: 44px;

    .animation-overlay {
      left: 0;
      right: 0;
    }
  }

  // Yuvarlak tek butonda overlay disari tasmasin: dairenin icinde kalsin.
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
