<template>
  <div class="gis-legend">
    <div class="legend-group" v-for="group in legendGroups" :key="group.name">
      <h4>{{ group.name }}</h4>
      <div class="legend-items">
        <div class="legend-item" v-for="item in group.items" :key="item.label">
          <span class="legend-symbol" :style="{ background: item.color }"></span>
          <span class="legend-label">{{ item.label }}</span>
          <span class="legend-count">{{ item.count }}</span>
        </div>
      </div>
    </div>
    <div class="legend-toggle">
      <el-switch v-model="showLegend" active-text="显示图例" inactive-text="隐藏图例" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface LegendItem {
  label: string
  color: string
  count: number
}

interface LegendGroup {
  name: string
  items: LegendItem[]
}

const showLegend = ref(true)

const legendGroups: LegendGroup[] = [
  {
    name: '土地利用',
    items: [
      { label: '建设用地', color: '#ff6b6b', count: 125 },
      { label: '农田', color: '#7bed9f', count: 89 },
      { label: '林地', color: '#2ed573', count: 234 },
      { label: '水域', color: '#70a1ff', count: 45 }
    ]
  },
  {
    name: '道路类型',
    items: [
      { label: '高速公路', color: '#ff4757', count: 12 },
      { label: '国道', color: '#ffa502', count: 34 },
      { label: '省道', color: '#ffcc00', count: 67 },
      { label: '县道', color: '#2ed573', count: 156 }
    ]
  },
  {
    name: '行政区划',
    items: [
      { label: '省级', color: '#3742fa', count: 34 },
      { label: '市级', color: '#5352ed', count: 333 },
      { label: '县级', color: '#6c5ce7', count: 2856 }
    ]
  }
]
</script>

<style scoped>
.gis-legend {
  padding: 20px;
}

.legend-group {
  margin-bottom: 24px;
}

.legend-group h4 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #303133;
  font-weight: 600;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
}

.legend-symbol {
  width: 20px;
  height: 20px;
  border-radius: 2px;
}

.legend-label {
  flex: 1;
  font-size: 13px;
  color: #606266;
}

.legend-count {
  font-size: 12px;
  color: #909399;
  background-color: #f5f7fa;
  padding: 2px 8px;
  border-radius: 10px;
}

.legend-toggle {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: flex-end;
}
</style>