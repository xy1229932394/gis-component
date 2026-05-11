<template>
  <div class="gis-map">
    <div class="map-container">
      <div class="map-placeholder">
        <el-icon :size="48" color="#409eff" icon="map" />
        <p>GIS 地图容器</p>
        <p class="hint">集成地图 SDK 后将在此显示地图</p>
      </div>
      <div class="map-controls">
        <el-button-group>
          <el-button size="small" icon="zoom-in">放大</el-button>
          <el-button size="small" icon="zoom-out">缩小</el-button>
          <el-button size="small" icon="refresh">重置</el-button>
        </el-button-group>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.gis-map {
  width: 100%;
  height: 100%;
}

.map-container {
  width: 100%;
  height: 300px;
  background: linear-gradient(135deg, #e8f4fc 0%, #f0f5fa 100%);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.map-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #606266;
}

.map-placeholder p {
  margin: 8px 0 4px;
  font-size: 16px;
}

.hint {
  font-size: 12px;
  color: #909399 !important;
}

.map-controls {
  position: absolute;
  bottom: 16px;
  right: 16px;
}
</style>