<template>
  <div class="gis-toolbar">
    <div class="toolbar-section">
      <h4>导航工具</h4>
      <el-space wrap>
        <el-button
          v-for="tool in navigationTools"
          :key="tool.id"
          :type="activeTool === tool.id ? 'primary' : 'default'"
          :icon="tool.icon"
          @click="selectTool(tool.id)"
        >
          {{ tool.name }}
        </el-button>
      </el-space>
    </div>
    <div class="toolbar-section">
      <h4>绘制工具</h4>
      <el-space wrap>
        <el-button
          v-for="tool in drawingTools"
          :key="tool.id"
          :type="activeTool === tool.id ? 'primary' : 'default'"
          :icon="tool.icon"
          @click="selectTool(tool.id)"
        >
          {{ tool.name }}
        </el-button>
      </el-space>
    </div>
    <div class="toolbar-section">
      <h4>其他工具</h4>
      <el-space wrap>
        <el-button
          v-for="tool in otherTools"
          :key="tool.id"
          :type="activeTool === tool.id ? 'primary' : 'default'"
          :icon="tool.icon"
          @click="selectTool(tool.id)"
        >
          {{ tool.name }}
        </el-button>
      </el-space>
    </div>
    <div class="toolbar-status">
      <span>当前工具: </span>
      <el-tag type="primary">{{ currentToolName }}</el-tag>
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

const activeTool = ref('pan')

const navigationTools: Tool[] = [
  { id: 'pan', name: '平移', icon: 'mouse-pointer' },
  { id: 'zoom-in', name: '放大', icon: 'zoom-in' },
  { id: 'zoom-out', name: '缩小', icon: 'zoom-out' },
  { id: 'move', name: '移动', icon: 'arrow-move' },
  { id: 'reset', name: '复位', icon: 'refresh' }
]

const drawingTools: Tool[] = [
  { id: 'point', name: '点', icon: 'circle-dot' },
  { id: 'line', name: '线', icon: 'minus' },
  { id: 'polygon', name: '多边形', icon: 'pentagon' },
  { id: 'rectangle', name: '矩形', icon: 'square' },
  { id: 'circle', name: '圆', icon: 'circle' }
]

const otherTools: Tool[] = [
  { id: 'delete', name: '删除', icon: 'delete' },
  { id: 'export', name: '导出', icon: 'download' },
  { id: 'settings', name: '设置', icon: 'setting' }
]

const currentToolName = computed(() => {
  const allTools = [...navigationTools, ...drawingTools, ...otherTools]
  const tool = allTools.find(t => t.id === activeTool.value)
  return tool?.name || '无'
})

const selectTool = (id: string) => {
  activeTool.value = activeTool.value === id ? '' : id
}
</script>

<style scoped>
.gis-toolbar {
  padding: 20px;
}

.toolbar-section {
  margin-bottom: 24px;
}

.toolbar-section h4 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #606266;
  border-left: 4px solid #409eff;
  padding-left: 8px;
}

.toolbar-status {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}
</style>