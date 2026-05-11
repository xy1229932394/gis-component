import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const theme = ref<'light' | 'dark'>('light')
  const componentList = ref([
    { id: 'map', name: '地图组件', description: 'GIS地图展示组件' },
    { id: 'layer', name: '图层组件', description: '图层管理组件' },
    { id: 'marker', name: '标记组件', description: '地图标记组件' },
    { id: 'toolbar', name: '工具栏组件', description: '地图工具栏' },
    { id: 'legend', name: '图例组件', description: '图层图例展示' },
    { id: 'measure', name: '测量组件', description: '距离面积测量' }
  ])

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
  }

  return {
    sidebarCollapsed,
    theme,
    componentList,
    toggleSidebar,
    setTheme
  }
})