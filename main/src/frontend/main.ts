import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { register as registerVueComponents } from '@/junk/vueComponents'
import '@/junk/imports'
import '@/junk/scss/tailwind.css'
import '@/wordManagement/wordManager'
import router from './router'
import App from './App.vue'
import tooltip from '@/directives/tooltip'
import contextMenu from '@/directives/contextMenu'
import tap from '@/directives/tap'







const app = createApp(App)
// @ts-expect-error app
window.app = app;

registerVueComponents(app)
const registerDirectives = () => {
  app.use(tap)
  app.directive('tooltip', tooltip)
  app.directive('contextMenu', contextMenu)
}
registerDirectives();

app.use(createPinia())
app.use(router)
app.config.performance = false;


app.mount('#app')
