<template>
  <div class="gis-marker">
    <div class="marker-list">
      <el-card
        v-for="marker in markers"
        :key="marker.id"
        class="marker-card"
        :shadow="marker.selected ? 'always' : 'hover'"
        @click="selectMarker(marker.id)"
      >
        <div class="marker-header">
          <el-icon :size="24" :color="marker.color" icon="map-marker" />
          <div class="marker-info">
            <h4>{{ marker.name }}</h4>
            <p>{{ marker.location }}</p>
          </div>
          <el-tag :type="getTagType(marker.type)">{{ marker.type }}</el-tag>
        </div>
        <div class="marker-coords">
          <span>坐标: {{ marker.coords.lat }}, {{ marker.coords.lng }}</span>
        </div>
        <div class="marker-actions">
          <el-button size="small" icon="edit">编辑</el-button>
          <el-button size="small" icon="delete" type="danger">删除</el-button>
        </div>
      </el-card>
    </div>
    <div class="marker-form">
      <el-form :model="newMarker" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="newMarker.name" placeholder="输入标记名称" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="newMarker.type" placeholder="选择类型">
            <el-option label="兴趣点" value="兴趣点" />
            <el-option label="建筑" value="建筑" />
            <el-option label="道路" value="道路" />
            <el-option label="区域" value="区域" />
          </el-select>
        </el-form-item>
        <el-form-item label="坐标">
          <el-input v-model="newMarker.coordsText" placeholder="格式: lat,lng" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addMarker">添加标记</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface Marker {
  id: number
  name: string
  type: string
  location: string
  coords: { lat: number; lng: number }
  color: string
  selected: boolean
}

const markers = ref<Marker[]>([
  {
    id: 1,
    name: '天安门广场',
    type: '兴趣点',
    location: '北京市东城区',
    coords: { lat: 39.9042, lng: 116.4074 },
    color: '#f56c6c',
    selected: false
  },
  {
    id: 2,
    name: '故宫博物院',
    type: '建筑',
    location: '北京市东城区',
    coords: { lat: 39.9163, lng: 116.3972 },
    color: '#e6a23c',
    selected: false
  },
  {
    id: 3,
    name: '长安街',
    type: '道路',
    location: '北京市中心',
    coords: { lat: 39.9087, lng: 116.4038 },
    color: '#67c23a',
    selected: true
  }
])

const newMarker = reactive({
  name: '',
  type: '兴趣点',
  coordsText: ''
})

const selectMarker = (id: number) => {
  markers.value.forEach(m => {
    m.selected = m.id === id
  })
}

const getTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    '兴趣点': 'primary',
    '建筑': 'warning',
    '道路': 'success',
    '区域': 'info'
  }
  return typeMap[type] || 'info'
}

const addMarker = () => {
  if (!newMarker.name || !newMarker.coordsText) return
  const [lat, lng] = newMarker.coordsText.split(',').map(Number)
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399']
  markers.value.push({
    id: Date.now(),
    name: newMarker.name,
    type: newMarker.type,
    location: '未知位置',
    coords: { lat, lng },
    color: colors[Math.floor(Math.random() * colors.length)],
    selected: false
  })
  newMarker.name = ''
  newMarker.coordsText = ''
}
</script>

<style scoped>
.gis-marker {
  display: flex;
  gap: 20px;
}

.marker-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.marker-card {
  cursor: pointer;
  transition: all 0.3s;
}

.marker-card:hover {
  border-color: #409eff;
}

.marker-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.marker-info h4 {
  margin: 0 0 4px;
  font-size: 14px;
}

.marker-info p {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.marker-coords {
  font-size: 12px;
  color: #606266;
  margin-bottom: 12px;
}

.marker-actions {
  display: flex;
  gap: 8px;
}

.marker-form {
  width: 300px;
}
</style>