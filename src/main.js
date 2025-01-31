import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import { CLIENT } from './database'
import "./assets/style.css";

console.log(CLIENT)

loadFonts()

createApp(App)
  .use(vuetify)
  .mount('#app')
