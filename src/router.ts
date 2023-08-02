import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import IndexPage from '@/pages/IndexPage.vue'
import ChannelPage from '@/pages/ChannelPage.vue'

const routes: Array<RouteRecordRaw> = [{
  path: '/',
  component: IndexPage
}, {
  path: '/:channel',
  component: ChannelPage,
  props: true
}]

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})
