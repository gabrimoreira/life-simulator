import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { listenForInstallPrompt } from './install'
import './style.css'

// Antes do mount: o navegador dispara `beforeinstallprompt` logo apos o load,
// e um listener montado junto com uma tela chegaria tarde demais.
listenForInstallPrompt()

createApp(App).use(createPinia()).mount('#app')
