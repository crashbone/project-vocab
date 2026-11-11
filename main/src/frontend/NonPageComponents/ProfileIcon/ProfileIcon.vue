<template>
    <!-- Top bar profile icon (user's initial); opens the profile menu. Styled by .top-bar .right .profile-icon (Page.scss). -->
    <div v-if="initial" class="pointer profile-icon" @click="openProfileMenu">{{ initial }}</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { openProfileMenu } from '@/junk/profileMenu'

const appStore = useAppStore()
const initial = computed(() => {
    const data = appStore.initialData
    return data?.logged_in && data.user ? data.user.name[0] : ''
})
</script>
