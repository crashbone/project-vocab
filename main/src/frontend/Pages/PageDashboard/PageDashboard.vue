<template>
    <div class="app-frame page dashboard">
        <!-- TODO: This is written for testing purposes until making sure back-end is working
            FIX IT!
        -->
        <div class="admin-bar" style="position: absolute; top: 60px; width: 100%; padding: 0 2px" v-if="initialData && initialData.user.email === 'offcrashbone@gmail.com'">
            <button @click="onAdminClick">ADMIN</button>
        </div>

        <!-- TOP BAR -->
        <div class="top-bar">
            <div class="top-bar-inner-container">
                <div class="left pointer"></div>
                <div class="middle header1">
                    PROJECT VOCAB
                </div>
                <div class="right">
                    <SvgX class="pointer" url="/main/src/frontend/assets/svg/search.svg" :width="27" :height="27" />
                    <div v-if="initialData" class="profile-icon pointer">{{ initialData.user.name[0] }}</div>
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
                        <div class="welcome-text">It's been 25 days since you practiced!</div>
                    </div>

                </div>
            </div>
            <template v-if="model">
                <div class="section"
                     v-for="(pageModelIdsGrouped, groupIndex) in [
                        model.pageModelIdsGrouped.recent.slice(0, model.AMOUNT_OF_PAGES_GROUPED),
                        model.pageModelIdsGrouped.frequent.slice(0, model.AMOUNT_OF_PAGES_GROUPED),
                        model.pageModelIdsGrouped.recent.slice(model.AMOUNT_OF_PAGES_GROUPED)]"
                     :key="groupIndex">
                    <div class="sub-title header1">
                        <template v-if="groupIndex === 0">RECENT</template>
                        <template v-if="groupIndex === 1">FREQUENT</template>
                        <template v-if="groupIndex === 2">{{ model.restTitle.toUpperCase() }}</template>
                    </div>
                    <div class="word-page-buttons-container">
                        <template v-for="(pageModel, index) in pageModelIdsGrouped.map((pageModelId: number) => model!.pageModelMap[pageModelId])"
                                  :key="index">
                            <ButtonX @tap="pageClick(pageModel.id)"
                                     :index="groupIndex * model.AMOUNT_OF_PAGES_GROUPED + index"
                                     v-context-menu="[
                                        { name: 'Delete', click: () => onDeleteClick(pageModel.id) },
                                    ]">
                                <div class="top-left">{{ pageModel.name }}</div>
                                <div class="bottom-left"> {{ pageModel.words.slice(0, 3).join(', ') }}</div>
                                <div class="top-right">{{ pageModel.words.length }} Words</div>
                                <div class="bottom-right">{{ getDateTitle(new Date(pageModel.lastEntryAt)) }}</div>
                            </ButtonX>
                        </template>
                    </div>
                </div>
            </template>
            <div v-else>initialData: {{ initialData }}</div>
            <div @click="newPageClick" class="add-page-button">+</div>

        </div>

    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { getDateTitle } from '@/junk/util/getDateTitle';
import { sendDeletePageRequest } from '@/wordManagement/deletePageRequest';
import type { InitialDataWithUser } from '@/junk/fetchInitialData';
import { sendTriggerGitUpdateRequest } from "@/junk/admin/triggerGitUpdateRequest";

const appStore = useAppStore()

const initialData = computed(() => {
    const data = appStore.initialData
    return data?.logged_in && data.user ? data as InitialDataWithUser : undefined
})
const model = computed(() => appStore.dashboardModel)

const router = useRouter()
const pageClick = (pageId: number) => {
    router.push({ name: 'page', params: { pageId } })
}
const newPageClick = () => {
    router.push({ name: 'add_page' })
}

const onDeleteClick = (pageId: number) => {
    sendDeletePageRequest({ id: pageId }).then(async (res) => {
        if (res.success) {
            await appStore.loadPages()
        }
    })
}

const onAdminClick = () => {
    sendTriggerGitUpdateRequest().then((res) => {
        console.log(res);
    })
}
</script>
<style src="./PageDashboard.scss" lang="scss"></style>