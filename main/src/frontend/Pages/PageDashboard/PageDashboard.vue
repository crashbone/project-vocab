<template>
    <div class="app-frame page dashboard">
        <!-- TODO: This is written for testing purposes until making sure back-end is working
            FIX IT!
        -->
        <div class="admin-bar" style="position: absolute; top: 60px; width: 100%; padding: 0 2px" v-if="isAdmin">
            <button @click="onAdminClick">ADMIN</button>
        </div>

        <!-- TOP BAR -->
        <div class="top-bar">
            <div class="top-bar-inner-container">
                <div class="left pointer"></div>
                <div v-if="!searchOpen" class="middle header1">
                    PROJECT VOCAB
                </div>
                <div v-else class="middle">
                    <input ref="search-input" v-model="searchQuery" class="search-input" type="text"
                           placeholder="Search pages and words" @keydown.esc="closeSearch" />
                </div>
                <div class="right">
                    <SvgX v-if="!searchOpen" class="pointer" url="/main/src/frontend/assets/svg/search.svg" :width="27" :height="27"
                          @click="openSearch" />
                    <SvgX v-else class="pointer" url="/main/src/frontend/assets/svg/x.svg" :width="18" :height="18"
                          style="align-self: center;" @click="closeSearch" />
                    <div v-if="initialData" class="profile-icon pointer" @click="onProfileClick">{{ initialData.user.name[0] }}</div>
                </div>
            </div>

        </div>

        <!-- CONTENT -->
        <div class="page-content-container-1">
            <div class="welcome-message">
                <div class="welcome-left">
                    <div class="welcome-img"></div>
                </div>
                <div class="welcome-right">
                    <div class="welcome-right-inner-container">
                        <div class="welcome-subtitle">Hey, welcome back!</div>
                        <div class="welcome-text">{{ welcomeText }}</div>
                    </div>

                </div>
            </div>
            <template v-if="model">
                <div class="section"
                     v-for="(section, groupIndex) in sections"
                     :key="section.title">
                    <div class="sub-title header1">{{ section.title }}</div>
                    <div v-if="searchQuery.trim() && section.ids.length === 0" class="no-results">No results</div>
                    <div class="word-page-buttons-container">
                        <template v-for="(pageModel, index) in section.ids.map((pageModelId: number) => model!.pageModelMap[pageModelId])"
                                  :key="index">
                            <ButtonX @tap="pageClick(pageModel.id)"
                                     :index="groupIndex * model.AMOUNT_OF_PAGES_GROUPED + index"
                                     v-context-menu="[
                                        { name: 'Delete', click: () => onDeleteClick(pageModel.id) },
                                    ]">
                                <div class="card-row">
                                    <div class="top-left">{{ pageModel.name }}</div>
                                    <div class="top-right">{{ pageModel.words.length }} {{ pageModel.type === PageType.MULTIPLE_CHOICE ? 'Questions' : 'Words' }}</div>
                                </div>
                                <div class="card-row">
                                    <div class="bottom-left"> {{ pageModel.words.slice(0, 3).join(', ') }}</div>
                                    <div class="bottom-right">{{ getDateTitle(new Date(pageModel.lastEntryAt)) }}</div>
                                </div>
                            </ButtonX>
                        </template>
                    </div>
                </div>
            </template>
            <div v-else>initialData: {{ initialData }}</div>
            <div @click="onAddClick" class="add-page-button">+</div>

        </div>

    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef } from "vue";
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { getDateTitle } from '@/junk/util/getDateTitle';
import { getPracticeGapText } from '@/junk/util/getPracticeGapText';
import { sendDeletePageRequest } from '@/wordManagement/deletePageRequest';
import type { InitialDataWithUser } from '@/junk/fetchInitialData';
import { sendTriggerGitUpdateRequest } from "@/junk/admin/triggerGitUpdateRequest";
import { showConfirmationPopup, closeConfirmationPopup } from '@/NonPageComponents/ConfirmationPopup/confirmationPopup'
import { showContextMenu } from '@/NonPageComponents/ContextMenu/contextMenu'
import { PageType } from '@/wordManagement/PageType';
import type { PageModel } from '@/wordManagement/PageModel';
import { sendLogoutRequest } from '@/wordManagement/logoutRequest';
import { toLandingPage } from '@/junk/router';

const appStore = useAppStore()

const initialData = computed(() => {
    const data = appStore.initialData
    return data?.logged_in && data.user ? data as InitialDataWithUser : undefined
})
const model = computed(() => appStore.dashboardModel)
// TODO: backend'deki roles.py'den gelmeli; simdilik eski admin-bar kontrolu.
const isAdmin = computed(() => initialData.value?.user.email === 'offcrashbone@gmail.com')

// En son calisilan sayfanin tarihine gore karsilama satiri.
const welcomeText = computed(() => {
    const dashboard = model.value
    const lastEntryAt = dashboard
        ? Math.max(0, ...Object.values(dashboard.pageModelMap ?? {}).map(p => p.lastEntryAt))
        : 0
    return getPracticeGapText(lastEntryAt > 0 ? new Date(lastEntryAt) : undefined)
})

/* ==============
 * === SEARCH ===
 * ============== */

const searchOpen = ref(false)
const searchQuery = ref('')
const searchInput = useTemplateRef<HTMLInputElement>('search-input')

const openSearch = () => {
    searchOpen.value = true
    nextTick().then(() => searchInput.value?.focus())
}

const closeSearch = () => {
    searchOpen.value = false
    searchQuery.value = ''
}

// Sayfa adi + icerik: kelime sayfalarinda iki yuz, coktan secmelide soru ve siklar.
const pageMatches = (page: PageModel, query: string) => {
    const texts = [
        page.name,
        ...page.wordModels.flatMap(w => [w.word, w.meaning]),
        ...page.questions.flatMap(q => [q.question, ...q.answers]),
    ]
    return texts.some(t => t?.toLowerCase().includes(query))
}

// Arama doluyken gruplar yerine tek bir sonuc bolumu (en son calisilan once).
const sections = computed(() => {
    const m = model.value
    if (!m) return []
    const query = searchQuery.value.trim().toLowerCase()
    if (query) {
        return [{
            title: 'RESULTS',
            ids: m.pageModelIdsGrouped.recent.filter(id => pageMatches(m.pageModelMap[id]!, query)),
        }]
    }
    return [
        { title: 'RECENT', ids: m.pageModelIdsGrouped.recent.slice(0, m.AMOUNT_OF_PAGES_GROUPED) },
        { title: 'FREQUENT', ids: m.pageModelIdsGrouped.frequent.slice(0, m.AMOUNT_OF_PAGES_GROUPED) },
        { title: m.restTitle.toUpperCase(), ids: m.pageModelIdsGrouped.recent.slice(m.AMOUNT_OF_PAGES_GROUPED) },
    ]
})


/* ==============
 * === LOGOUT ===
 * ============== */

const onProfileClick = (event: Event) => {
    showContextMenu({
        event,
        placement: 'bottom',
        align: 'end',
        items: [{ name: 'Logout', click: logout }],
    })
}

const logout = async () => {
    const res = await sendLogoutRequest()
    if (!res.success) {
        showConfirmationPopup({
            title: `Could not log out: ${res.error ?? 'unknown error'}`,
            buttons: [{ name: 'OK', click: closeConfirmationPopup }],
        })
        return
    }
    appStore.initialData = { logged_in: false }
    appStore.dashboardModel = undefined
    toLandingPage()
}

const router = useRouter()
const pageClick = (pageId: number) => {
    const isMultipleChoice = model.value?.pageModelMap[pageId]?.type === PageType.MULTIPLE_CHOICE
    router.push({ name: isMultipleChoice ? 'multiple_choice' : 'page', params: { pageId } })
}
const newPageClick = (type: PageType = PageType.PAGE) => {
    router.push({ name: 'add_page', query: type === PageType.PAGE ? {} : { type } })
}
// Admin icin + bir menu acar; digerleri icin dogrudan yeni sayfa.
const onAddClick = (event: Event) => {
    if (!isAdmin.value) {
        newPageClick()
        return
    }
    showContextMenu({
        event,
        placement: 'top',
        align: 'end',
        items: [
            { name: 'New Page', click: () => newPageClick(PageType.PAGE) },
            { name: 'New Multiple Choice', click: () => newPageClick(PageType.MULTIPLE_CHOICE) },
        ],
    })
}

const onDeleteClick = (pageId: number) => {
    sendDeletePageRequest({ id: pageId }).then(async (res) => {
        if (res.success) {
            await appStore.loadPages()
        }
    })
}

const onAdminClick = () => {
    showConfirmationPopup({
        title: 'Git update tetiklensin mi?',
        buttons: [
            { name: 'Cancel', click: closeConfirmationPopup },
            {
                name: 'OK', click: () => {
                    closeConfirmationPopup()
                    sendTriggerGitUpdateRequest().then((res) => {
                        console.log(res);
                    })
                }
            },
        ],
    })
}
</script>
<style src="./PageDashboard.scss" lang="scss"></style>