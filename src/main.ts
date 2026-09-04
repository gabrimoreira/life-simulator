import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { listenForInstallPrompt } from './install'
import { useGameStore } from './stores/game'
import './style.css'

// Antes do mount: o navegador dispara `beforeinstallprompt` logo apos o load,
// e um listener montado junto com uma tela chegaria tarde demais.
listenForInstallPrompt()

const app = createApp(App)
app.use(createPinia())

// Rede de seguranca de ultima instancia.
//
// Vue engole excecoes de handler e de watcher: uma escolha de evento que
// estourasse deixava o jogo parado com o modal aberto, sem mensagem nenhuma
// na tela e sem saida a nao ser limpar os dados do site. Registrar no store e
// o que permite ao jogador ver o que houve, baixar o save e recarregar.
app.config.errorHandler = (error) => {
  console.error(error)
  useGameStore().reportFatal(error)
}

app.mount('#app')
