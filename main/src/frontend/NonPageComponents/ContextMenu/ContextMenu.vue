<template>
    <Teleport to="body">
        <div v-if="state.visible" class="context-menu-overlay" @click="close">
            <div class="context-menu-popup" :style="positionStyle" @click.stop>
                <div v-for="(item, i) in state.items" :key="i"
                     class="context-menu-item"
                     :class="{ disabled: item.disabled }"
                     @click="!item.disabled && onItemClick(item)">
                    {{ item.name }}
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { contextMenuState as state, closeContextMenu as close, type ContextMenuItem } from './contextMenu'

const positionStyle = computed(() => {
    const rect = state.triggerRect
    if (!rect) return {}

    const centerX = rect.left + rect.width / 2

    if (state.placement === 'top') {
        return {
            bottom: `${window.innerHeight - rect.top + state.offset}px`,
            left: `${centerX}px`,
            transform: 'translateX(-50%)',
        }
    } else {
        return {
            top: `${rect.bottom + state.offset}px`,
            left: `${centerX}px`,
            transform: 'translateX(-50%)',
        }
    }
})

const onItemClick = (item: ContextMenuItem) => {
    item.click()
    close()
}
</script>

<style lang="scss">
.context-menu-overlay {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: rgba(0, 0, 0, 0.08);
}

.context-menu-popup {
    position: fixed;
    background: linear-gradient(60deg, $color-pastel-pink-100, white 40%);
    border: 1px solid rgba(0, 0, 0, 0.4);
    color: $color-lilac-800;
    border-radius: 14px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    padding: 6px 4px;
    min-width: 180px;
    font-size: 14px;
    animation: contextMenuPopIn 0.15s ease-out;

    .context-menu-item {
        padding: 10px 18px;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 600;

        &:hover:not(.disabled) {
            background-color: $color-pastel-pink-100;
        }

        &.disabled {
            opacity: 0.35;
            cursor: default;
        }
    }
}

@keyframes contextMenuPopIn {
    0% {
        opacity: 0;
        transform: translateX(-50%) scale(0.85);
    }
    100% {
        opacity: 1;
        transform: translateX(-50%) scale(1);
    }
}
</style>
