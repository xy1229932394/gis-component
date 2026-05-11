<template>
  <div class="home-container">
    <el-card class="welcome-card" shadow="hover">
      <div class="welcome-content">
        <h1 class="title">GIS Component Library</h1>
        <p class="subtitle">基于 Vue3 + Pinia + Element Plus 的 GIS 组件库</p>
        <div class="features">
          <div class="feature-item">
            <el-icon :size="32" color="#409eff" icon="map" />
            <span>专业地图组件</span>
          </div>
          <div class="feature-item">
            <el-icon :size="32" color="#67c23a" icon="layers" />
            <span>图层管理</span>
          </div>
          <div class="feature-item">
            <el-icon :size="32" color="#e6a23c" icon="map-marker" />
            <span>标记交互</span>
          </div>
          <div class="feature-item">
            <el-icon :size="32" color="#f56c6c" icon="ruler" />
            <span>测量工具</span>
          </div>
        </div>
        <el-button type="primary" size="large" @click="goToComponents">
          查看组件
          <el-icon icon="arrow-right" />
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToComponents = () => {
  router.push('/components')
}
</script>

<style scoped>
.home-container {
  padding: 40px;
  display: flex;
  justify-content: center;
}

.welcome-card {
  width: 100%;
  max-width: 800px;
  padding: 60px;
}

.welcome-content {
  text-align: center;
}

.title {
  font-size: 36px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 16px;
}

.subtitle {
  font-size: 16px;
  color: #909399;
  margin-bottom: 40px;
}

.features {
  display: flex;
  justify-content: center;
  gap: 48px;
  margin-bottom: 40px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #606266;
}
</style>