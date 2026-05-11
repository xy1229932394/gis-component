<template>
  <div class="gis-measure">
    <div class="measure-tools">
      <h4>测量工具</h4>
      <el-space wrap>
        <el-button
          v-for="tool in measureTools"
          :key="tool.id"
          :type="activeTool === tool.id ? 'primary' : 'default'"
          :icon="tool.icon"
          @click="selectTool(tool.id)"
        >
          {{ tool.name }}
        </el-button>
      </el-space>
    </div>
    <div class="measure-results">
      <h4>测量结果</h4>
      <el-table :data="measureResults" border>
        <el-table-column prop="id" label="序号" width="60" />
        <el-table-column prop="type" label="类型" width="80" />
        <el-table-column prop="value" label="数值" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="action" label="操作" width="80">
          <template #default>
            <el-button size="small" icon="delete" type="danger" @click="clearResults">清除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="measure-stats">
      <el-card class="stats-card">
        <div class="stat-item">
          <span class="stat-label">总测量次数</span>
          <span class="stat-value">{{ measureResults.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总距离</span>
          <span class="stat-value">{{ totalDistance }} km</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总面积</span>
          <span class="stat-value">{{ totalArea }} km²</span>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Tool {
  id: string
  name: string
  icon: string
}

interface MeasureResult {
  id: number
  type: string
  value: number
  unit: string
}

const activeTool = ref('distance')

const measureTools: Tool[] = [
  { id: 'distance', name: '距离', icon: 'minus' },
  { id: 'area', name: '面积', icon: 'square' },
  { id: 'angle', name: '角度', icon: 'triangle' }
]

const measureResults = ref<MeasureResult[]>([
  { id: 1, type: '距离', value: 12.5, unit: 'km' },
  { id: 2, type: '面积', value: 8.3, unit: 'km²' },
  { id: 3, type: '距离', value: 5.2, unit: 'km' },
  { id: 4, type: '角度', value: 45.5, unit: '°' }
])

const totalDistance = computed(() => {
  return measureResults.value
    .filter(r => r.type === '距离')
    .reduce((sum, r) => sum + r.value, 0)
    .toFixed(1)
})

const totalArea = computed(() => {
  return measureResults.value
    .filter(r => r.type === '面积')
    .reduce((sum, r) => sum + r.value, 0)
    .toFixed(1)
})

const selectTool = (id: string) => {
  activeTool.value = activeTool.value === id ? '' : id
}

const clearResults = () => {
  measureResults.value = []
}
</script>

<style scoped>
.gis-measure {
  padding: 20px;
}

.measure-tools {
  margin-bottom: 24px;
}

.measure-tools h4 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #606266;
  border-left: 4px solid #409eff;
  padding-left: 8px;
}

.measure-results {
  margin-bottom: 24px;
}

.measure-results h4 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #606266;
  border-left: 4px solid #67c23a;
  padding-left: 8px;
}

.measure-stats {
  margin-top: 24px;
}

.stats-card {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}
</style>