import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 这一行会去寻找 router 文件夹

const app = createApp(App)
app.use(router)
app.mount('#app')
