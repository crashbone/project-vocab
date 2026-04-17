<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { toDashboard, toLandingPage } from './junk/router';
import { setWordColorsAsCSSVariables } from './Pages/PageWords/wordColors';
import router from './router';

setWordColorsAsCSSVariables();

function addMobileClassIfMobile() {
    if (/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        document.documentElement.classList.add('mobile');
    }
}

addMobileClassIfMobile();

const appStore = useAppStore()

onMounted(async () => {
    await router.isReady();
    const pagesToBeIgnored = ['portfolio'];
    if (pagesToBeIgnored.includes(router.currentRoute.value.name as string)) {
        return;
    }
    const data = await appStore.loadInitialData()
    if (data.logged_in) {
        const pagesToBeDirectedToDashboard = ['login', 'loading']
        if (pagesToBeDirectedToDashboard.includes(router.currentRoute.value.name as string)) {
            toDashboard();
        }
        await appStore.loadPages()
    } else {
        toLandingPage();
    }
})
</script>

<template>
    <router-view />
    <ContextMenu />
    <ConfirmationPopup />
</template>
