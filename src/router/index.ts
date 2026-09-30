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
  //绘点
  {
    path: '/gis-marker',
    name: 'GisMarkerPreview',
    component: () => import('@/views/GisMarker/index.vue')
  },
  //绘面
  {
    path: '/amap-area',
    name: 'AmapAreaPreview',
    component: () => import('@/views/GisMarker/AmapPreview.vue')
  },
  //聚合撒点
  {
    path: '/amap-scatter',
    name: 'AmapScatterPreview',
    component: () => import('@/views/GisScatter/AmapScatter.vue')
  },
  //3D模型
  {
    path: '/amap-model',
    name: 'AmapModelPreview',
    component: () => import('@/views/GisModel/ModelPreview.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router