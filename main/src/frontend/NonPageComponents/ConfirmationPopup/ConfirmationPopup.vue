<template>
    <Teleport to="body">
        <div v-if="state.visible" class="confirmation-popup-overlay" @click="close">
            <div class="confirmation-popup" @click.stop>
                <div class="confirmation-popup-close pointer" @click="close">
                    <SvgX url="/main/src/frontend/assets/svg/x.svg" :width="14" :height="14" />
                </div>
                <div v-if="state.title" class="confirmation-popup-title">{{ state.title }}</div>
                <div v-if="state.buttons?.length" class="confirmation-popup-buttons">
                    <div v-for="(btn, i) in state.buttons" :key="i"
                         class="confirmation-popup-btn pointer"
                         @click="btn.click">
                        {{ btn.name }}
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { confirmationPopupState, closeConfirmationPopup } from './confirmationPopup'

const state = confirmationPopupState
const close = closeConfirmationPopup
</script>

<style lang="scss">
.confirmation-popup-overlay {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: rgba(0, 0, 0, 0.25);
    display: flex;
    justify-content: center;
    align-items: center;
}

.confirmation-popup {
    position: relative;
    background: linear-gradient(60deg, $color-pastel-pink-100, white 40%);
    border: 1px solid rgba(0, 0, 0, 0.3);
    color: $color-lilac-800;
    border-radius: 18px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
    padding: 24px 28px;
    min-width: 220px;
    text-align: center;
    animation: confirmationPopupIn 0.15s ease-out;

    .confirmation-popup-close {
        position: absolute;
        top: 10px;
        right: 12px;
        padding: 4px;
        opacity: 0.5;

        &:hover {
            opacity: 1;
        }
    }

    .confirmation-popup-title {
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 18px;
    }

    .confirmation-popup-buttons {
        display: flex;
        gap: 12px;
        justify-content: center;

        .confirmation-popup-btn {
            padding: 10px 22px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 14px;
            background: rgba($color-lilac-700, 0.1);
            border: 1px solid rgba($color-lilac-700, 0.3);

            &:hover {
                background: rgba($color-lilac-700, 0.2);
            }
        }
    }
}

@keyframes confirmationPopupIn {
    0% {
        opacity: 0;
        transform: scale(0.85);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}
</style>
