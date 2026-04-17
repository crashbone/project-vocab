import { reactive } from 'vue'

interface PopupButton {
    name: string
    click: () => void
}

export const confirmationPopupState = reactive({
    visible: false,
    title: '',
    buttons: [] as PopupButton[],
})

export function showConfirmationPopup(options: { title: string; buttons: PopupButton[] }) {
    confirmationPopupState.title = options.title
    confirmationPopupState.buttons = options.buttons
    confirmationPopupState.visible = true
}

export function closeConfirmationPopup() {
    confirmationPopupState.visible = false
}
