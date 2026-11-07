import { useAppStore } from '@/stores/appStore'
import type { InitialDataWithUser } from '@/junk/fetchInitialData'
import { sendTriggerGitUpdateRequest } from '@/junk/admin/triggerGitUpdateRequest'
import { showConfirmationPopup, closeConfirmationPopup } from '@/NonPageComponents/ConfirmationPopup/confirmationPopup'
import { showContextMenu } from '@/NonPageComponents/ContextMenu/contextMenu'
import { sendLogoutRequest } from '@/wordManagement/logoutRequest'
import { toLandingPage } from '@/junk/router'

// TODO: backend'deki roles.py'den gelmeli; simdilik eski admin-bar kontrolu.
export const isAdminUser = (): boolean => {
    const data = useAppStore().initialData
    return !!(data?.logged_in && data.user && (data as InitialDataWithUser).user.email === 'offcrashbone@gmail.com')
}

// Dashboard ve kelime sayfasindaki profil butonu icin ortak menu.
export const openProfileMenu = (event: Event) => {
    const items = isAdminUser()
        ? [{ name: 'Deploy Frontend', click: onAdminClick }, { name: 'Logout', click: logout }]
        : [{ name: 'Logout', click: logout }]
    showContextMenu({ event, placement: 'bottom', align: 'end', items })
}

const logout = async () => {
    const appStore = useAppStore()
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
