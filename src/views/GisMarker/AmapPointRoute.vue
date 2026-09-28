<template>
  <div class="amap-page">
    <div class="toolbar">
      <button class="btn" :disabled="!isReady" @click="toggleDrawMode">
        {{ isDrawMode ? '结束绘点' : '开始绘点' }}
      </button>
      <button class="btn btn-light" :disabled="!isReady || !waypoints.length" @click="undoLastPoint">撤销一点</button>
      <button class="btn btn-light" :disabled="!isReady" @click="clearAll">清空</button>

      <span class="meta">当前模式：{{ isDrawMode ? '绘点中（左键地图添加点）' : '浏览' }}</span>
      <span class="meta">航线里程：{{ formatDistance(routeDistanceMeters) }}</span>
      <span class="meta success">航点数：{{ waypoints.length }}</span>
    </div>

    <div ref="mapRef" class="map"></div>

    <div v-if="initLoading" class="overlay">
      <div class="panel">AMap 初始化中...</div>
    </div>

    <div v-if="initError" class="overlay">
      <div class="panel error">
        <div class="title">AMap 初始化失败</div>
        <div class="desc">{{ initError }}</div>

        <div class="field-block">
          <label>高德 Key</label>
          <input v-model.trim="manualKey" placeholder="请输入可用的 JSAPI Key" />
        </div>

        <div class="field-block">
          <label>安全密钥（可选）</label>
          <input v-model.trim="manualSecurityCode" placeholder="如已开启安全校验请填写" />
        </div>

        <div class="actions">
          <button class="btn" @click="retryInit">重试初始化</button>
          <button class="btn btn-light" @click="reloadPage">刷新页面</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { loadAMap } from '@/utils/amap'

type LngLatPoint = [number, number]

const mapRef = ref<HTMLElement | null>(null)

const initLoading = ref(false)
const initError = ref('')
const isReady = ref(false)
const isDrawMode = ref(false)

const manualKey = ref((import.meta as any).env?.VITE_AMAP_KEY || '')
const manualSecurityCode = ref((import.meta as any).env?.VITE_AMAP_SECURITY_CODE || '')

const waypoints = ref<LngLatPoint[]>([])
const routeDistanceMeters = ref(0)

let map: any = null
let AMapSDK: any = null
let polyline: any = null
let markers: any[] = []
let mapClickHandler: ((e: any) => void) | null = null

onMounted(() => {
  initMap()
})

onBeforeUnmount(() => {
  destroyMap()
})

const initMap = async () => {
  if (!mapRef.value) return

  initLoading.value = true
  initError.value = ''
  isReady.value = false

  destroyMap()

  try {
    const key = manualKey.value || ''
    const securityCode = manualSecurityCode.value || ''

    AMapSDK = await loadAMap(key, securityCode)

    map = new AMapSDK.Map(mapRef.value, {
      zoom: 15,
      center: [112.9388, 28.2282],
      viewMode: '2D'
    })

    map.addControl(new AMapSDK.Scale())
    bindMapClick()

    isReady.value = true
  } catch (err: any) {
    initError.value = parseAmapError(err)
    console.error('AMap 初始化失败：', err)
  } finally {
    initLoading.value = false
  }
}

const retryInit = async () => {
  await initMap()
}

const reloadPage = () => {
  window.location.reload()
}

const destroyMap = () => {
  if (map && mapClickHandler) {
    map.off('click', mapClickHandler)
  }

  clearGraphics()

  if (map) {
    map.destroy()
    map = null
  }

  mapClickHandler = null
  AMapSDK = null
  isReady.value = false
  isDrawMode.value = false
}

const bindMapClick = () => {
  if (!map) return

  mapClickHandler = (e: any) => {
    if (!isDrawMode.value) return
    const lng = e?.lnglat?.lng
    const lat = e?.lnglat?.lat
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return

    waypoints.value.push([Number(lng), Number(lat)])
    renderRoute()
  }

  map.on('click', mapClickHandler)
}

const toggleDrawMode = () => {
  if (!isReady.value || !map) return
  isDrawMode.value = !isDrawMode.value
  map.setDefaultCursor(isDrawMode.value ? 'crosshair' : 'default')
}

const undoLastPoint = () => {
  if (!waypoints.value.length) return
  waypoints.value.pop()
  renderRoute()
}

const clearAll = () => {
  waypoints.value = []
  routeDistanceMeters.value = 0
  isDrawMode.value = false
  if (map) map.setDefaultCursor('default')
  clearGraphics()
}

const clearGraphics = () => {
  markers.forEach((m) => removeOverlay(m))
  markers = []

  if (polyline) {
    removeOverlay(polyline)
    polyline = null
  }
}

const renderRoute = () => {
  clearGraphics()

  if (!map || !AMapSDK) return

  waypoints.value.forEach((point: LngLatPoint, idx: number) => {
    const marker = new AMapSDK.Marker({
      position: point,
      offset: new AMapSDK.Pixel(-8, -8)
    })
    marker.setLabel({
      content: `<div class=\"point-label\">${idx + 1}</div>`,
      direction: 'center'
    })
    map.add(marker)
    markers.push(marker)
  })

  if (waypoints.value.length > 1) {
    polyline = new AMapSDK.Polyline({
      path: waypoints.value,
      strokeColor: '#f59e0b',
      strokeWeight: 3,
      strokeOpacity: 0.95,
      showDir: true,
      zIndex: 20
    })
    map.add(polyline)
  }

  routeDistanceMeters.value = calculateRouteDistance(waypoints.value)
}

const removeOverlay = (overlay: any) => {
  if (!overlay || !map) return
  overlay.setMap?.(null)
  map.remove?.(overlay)
}

function calculateRouteDistance(route: LngLatPoint[]): number {
  if (route.length < 2) return 0
  let total = 0
  for (let i = 1; i < route.length; i++) {
    total += getDistanceMeters(route[i - 1], route[i])
  }
  return total
}

function getDistanceMeters(a: LngLatPoint, b: LngLatPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const [lng1, lat1] = a
  const [lng2, lat2] = b
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const rLat1 = toRad(lat1)
  const rLat2 = toRad(lat2)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
  return 6378137 * c
}

function formatDistance(meters: number): string {
  if (!meters) return '0m'
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)}km`
  return `${meters.toFixed(1)}m`
}

function parseAmapError(err: any): string {
  if (!err) return '未知错误'
  if (typeof err === 'string') return err
  if (err.message) return err.message
  try {
    return JSON.stringify(err)
  } catch {
    return String(err)
  }
}
</script>

<style scoped>
.amap-page {
  height: 100vh;
  width: 100%;
  position: relative;
  background: #f8fafc;
}

.toolbar {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 999;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: calc(100% - 24px);
}

.btn {
  border: none;
  background: #1677ff;
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-light {
  background: #64748b;
}

.meta {
  font-size: 12px;
  color: #334155;
}

.meta.success {
  color: #0f766e;
  font-weight: 600;
}

.map {
  height: 100%;
  width: 100%;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.28);
  z-index: 1000;
}

.panel {
  width: min(600px, calc(100% - 32px));
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.2);
  padding: 16px;
  color: #0f172a;
}

.panel.error {
  border: 1px solid #fecaca;
}

.title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
}

.desc {
  font-size: 13px;
  color: #b91c1c;
  margin-bottom: 12px;
  word-break: break-all;
}

.field-block {
  display: grid;
  gap: 6px;
  margin-bottom: 10px;
}

.field-block input {
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 8px 10px;
}

.actions {
  display: flex;
  gap: 8px;
}
</style>

<style>
.point-label {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #145cfc;
  color: #fff;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  border: 1px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
}
</style>
