<template>
  <div class="gis-layer">
    <el-tree
      :data="layerTree"
      :props="defaultProps"
      show-checkbox
      node-key="id"
      default-expand-all
      highlight-current
    >
      <template #default="{ node, data }">
        <span class="custom-tree-node">
          <span>
            <el-icon :size="16" :color="data.color" :icon="data.icon" />
          </span>
          <span>{{ node.label }}</span>
          <span v-if="data.status === 'active'" class="status-badge active">
            已加载
          </span>
          <span v-else class="status-badge inactive">未加载</span>
        </span>
      </template>
    </el-tree>
  </div>
</template>

<script setup lang="ts">
interface Layer {
  id: string
  label: string
  icon: string
  color: string
  status: 'active' | 'inactive'
  children?: Layer[]
}

const layerTree: Layer[] = [
  {
    id: 'base',
    label: '基础图层',
    icon: 'layers',
    color: '#409eff',
    status: 'active',
    children: [
      { id: 'road', label: '道路图层', icon: 'grid-3x3', color: '#67c23a', status: 'active' },
      { id: 'building', label: '建筑图层', icon: 'grid-3x3', color: '#e6a23c', status: 'active' },
      { id: 'satellite', label: '卫星影像', icon: 'image', color: '#f56c6c', status: 'inactive' }
    ]
  },
  {
    id: 'overlay',
    label: '覆盖图层',
    icon: 'layers',
    color: '#909399',
    status: 'active',
    children: [
      { id: 'poi', label: 'POI点', icon: 'map-marker', color: '#409eff', status: 'active' },
      { id: 'heatmap', label: '热力图', icon: 'image', color: '#f56c6c', status: 'inactive' },
      { id: 'boundary', label: '行政区划', icon: 'grid-3x3', color: '#67c23a', status: 'active' }
    ]
  }
]

const defaultProps = {
  children: 'children',
  label: 'label'
}
</script>

<style scoped>
.gis-layer {
  width: 100%;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.status-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
}

.status-badge.active {
  background-color: #e8f5e9;
  color: #67c23a;
}

.status-badge.inactive {
  background-color: #fafafa;
  color: #909399;
}
</style>