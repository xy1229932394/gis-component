import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/components',
    name: 'Components',
    component: () => import('@/views/Components.vue')
  },
  {
    path: '/amap-gis-preview',
    name: 'AmapGisPreview',
    component: () => import('@/views/GisMarker/index.vue')
  },
  {
    path: '/gis-marker-preview',
    name: 'GisMarkerPreview',
    component: () => import('@/views/GisMarker/index.vue')
  },
  {
    path: '/amap-area-preview',
    name: 'AmapAreaPreview',
    component: () => import('@/views/GisMarker/AmapPreview.vue')
  },
  {
    path: '/amap-scatter-preview',
    name: 'AmapScatterPreview',
    component: () => import('@/views/GisScatter/AmapScatter.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router