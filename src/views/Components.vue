<template>
  <div class="components-container">
    <div class="sidebar">
      <el-menu
        :default-active="activeComponent"
        mode="vertical"
        background-color="#fff"
        text-color="#303133"
        active-text-color="#409eff"
        class="sidebar-menu"
      >
        <el-menu-item
          v-for="component in componentList"
          :key="component.id"
          :index="component.id"
          @click="selectComponent(component.id)"
        >
          <el-icon :icon="getIcon(component.id)" />
          <span>{{ component.name }}</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="main-content">
      <el-card :title="currentComponent?.name" shadow="hover">
        <div class="component-demo">
          <component :is="currentDemo" />
        </div>
        <div class="component-description">
          <p>{{ currentComponent?.description }}</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw } from 'vue'
import { useAppStore } from '@/stores/app'
import GisMap from '@/components/GisMap.vue'
import GisLayer from '@/components/GisLayer.vue'
import GisMarker from '@/components/GisMarker.vue'
import GisToolbar from '@/components/GisToolbar.vue'
import GisLegend from '@/components/GisLegend.vue'
import GisMeasure from '@/components/GisMeasure.vue'

const store = useAppStore()
const componentList = computed(() => store.componentList)
const activeComponent = ref('map')

const iconMap: Record<string, string> = {
  map: 'map',
  layer: 'layers',
  marker: 'map-marker',
  toolbar: 'tool',
  legend: 'bar-chart',
  measure: 'ruler'
}

const demoMap: Record<string, unknown> = {
  map: markRaw(GisMap),
  layer: markRaw(GisLayer),
  marker: markRaw(GisMarker),
  toolbar: markRaw(GisToolbar),
  legend: markRaw(GisLegend),
  measure: markRaw(GisMeasure)
}

const currentComponent = computed(() => {
  return componentList.value.find(c => c.id === activeComponent.value)
})

const currentDemo = computed(() => demoMap[activeComponent.value])

const getIcon = (id: string) => iconMap[id]

const selectComponent = (id: string) => {
  activeComponent.value = id
}
</script>

<style scoped>
.components-container {
  display: flex;
  min-height: calc(100vh - 60px);
}

.sidebar {
  width: 200px;
  border-right: 1px solid #e4e7ed;
  background-color: #fff;
}

.sidebar-menu {
  height: 100%;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

.component-demo {
  padding: 20px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  margin-bottom: 20px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.component-description {
  color: #909399;
  font-size: 14px;
}
</style>