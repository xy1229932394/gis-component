<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { preloadAMap } from '@/utils/amap'

onMounted(() => {
  preloadAMap()
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
}
</style>
