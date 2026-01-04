<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import { fetchPagesBuildDashboardModel } from '@/wordManagement/wordManagerVue'
import { globalData } from '@/junk/globalData'
import { fetchInitialData, type InitialData } from './junk/fetchInitialData';
import { toDashboard, toLandingPage } from './junk/router';
import { publish, subscribe } from './junk/EventBus';
import { setWordColorsAsCSSVariables } from './Pages/PageWords/wordColors';
import router from './router';

setWordColorsAsCSSVariables();

function addMobileClassIfMobile() {
    if (/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        document.documentElement.classList.add('mobile');
    }
}

// Call the function
addMobileClassIfMobile();
const initialData: Ref<InitialData | undefined> = ref(undefined);

onMounted(async () => {
    fetchInitialData().then((response: InitialData) => {
        globalData.initialData = response;
        publish('initialDataFetched', response);
        initialData.value = response;
        if (initialData.value.logged_in) {
            onInitialDataShowsThatUserIsLoggedIn();
        } else {
            onNotLoggedIn();
        }
    }).catch(() => {
        publish('initialDataFetched', { logged_in: false });
        onNotLoggedIn();
    })
})

const onInitialDataShowsThatUserIsLoggedIn = () => {
    const pagesToBeDirectedToDashboard = ['login', 'loading']
    if (pagesToBeDirectedToDashboard.includes(router.currentRoute.value.name as string)) {
        toDashboard();
    }
    fetchPagesBuildDashboardModel()
        .then(pagesResult => {
            globalData.dashboardModel = pagesResult
            publish('pagesFetched', pagesResult);
        })
}

subscribe('userLoggedIn', () => {
    onInitialDataShowsThatUserIsLoggedIn();
})

const onNotLoggedIn = () => {
    toLandingPage();
}


</script>

<template>
    <router-view />
</template>
