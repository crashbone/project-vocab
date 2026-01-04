import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { register as registerVueComponents } from '@/junk/vueComponents'
import '@/junk/imports'
import '@/wordManagement/wordManager'
import router from './router'
import App from './App.vue'
import tooltip from '@/directives/tooltip'
import contextMenu from '@/directives/contextMenu'
import tap from '@/directives/tap'






const app = createApp(App)
// @ts-expect-error app
window.app = app;

registerVueComponents()
const registerDirectives = () => {
  app.use(tap)
  app.directive('tooltip', tooltip)
  app.directive('contextMenu', contextMenu)
}
registerDirectives();

app.use(createPinia())
app.use(router)


app.mount('#app')
