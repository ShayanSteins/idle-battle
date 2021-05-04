import Vue from 'vue'
import App from './App.vue'
import 'regenerator-runtime/runtime'
import { Store } from './assets/store.js'

Vue.use(Store)

new Vue({
  render: h => h(App)
}).$mount('#app')
