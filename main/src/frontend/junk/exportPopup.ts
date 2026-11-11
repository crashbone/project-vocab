import { showConfirmationPopup, closeConfirmationPopup } from '@/NonPageComponents/ConfirmationPopup/confirmationPopup'

/** Export popup shared by pages: copy the text to the clipboard or download it as a .txt file. */
export const showExportPopup = (title: string, text: string, fileName: string) => {
    showConfirmationPopup({
        title,
        buttons: [
            {
                name: 'Copy',
                click: async () => {
                    await navigator.clipboard.writeText(text)
                    closeConfirmationPopup()
                },
            },
            {
                name: 'Download',
                click: () => {
                    const blob = new Blob([text], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `${fileName}.txt`
                    a.click()
                    URL.revokeObjectURL(url)
                    closeConfirmationPopup()
                },
            },
        ],
    })
}
