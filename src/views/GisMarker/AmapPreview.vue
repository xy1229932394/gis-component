<template>
  <div class="amap-page">
    <div class="toolbar">
      <button class="btn" :disabled="!canStartDraw" @click="startDrawPolygon">绘制区域</button>
      <button class="btn btn-light" :disabled="!isReady" @click="clearAll">清空</button>

      <div class="field">
        <label>飞行高度(m)</label>
        <input v-model.number="height" type="number" min="20" max="500" />
      </div>

      <div class="field">
        <label>旁向重叠率(%)</label>
        <input v-model.number="lateralOverlapRate" type="number" min="10" max="90" />
      </div>

      <div class="field">
        <label>主航向角(°)</label>
        <input v-model.number="mainCourseAngle" type="number" min="0" max="179" />
      </div>

      <span class="meta">航线间距：{{ spacingMeters.toFixed(1) }}m</span>
      <span class="meta">航线里程：{{ formatDistance(routeDistanceMeters) }}</span>
      <span v-if="routeCount" class="meta success">航点数：{{ routeCount }}</span>
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

        <div class="help">建议在 `.env.local` 中配置：`VITE_AMAP_KEY`、`VITE_AMAP_SECURITY_CODE`。</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { loadAMap } from '@/utils/amap'

// 经纬度坐标 [lng, lat]
type LngLatPoint = [number, number]
// 局部平面坐标 [x, y]（单位：米）
type XYPoint = [number, number]

// 地图容器 DOM 引用
const mapRef = ref<HTMLElement | null>(null)
// 当前生成的航点数量
const routeCount = ref(0)
// 当前航线总里程（单位：米）
const routeDistanceMeters = ref(0)

// 航线参数：飞行高度 / 旁向重叠率 / 主航向角
const height = ref(100)
const lateralOverlapRate = ref(60)
const mainCourseAngle = ref(90)

// 地图初始化状态
const initLoading = ref(false)
const initError = ref('')
const isReady = ref(false)

// 单区域模式：已有绘制区后锁定新建，必须手动清空
const hasDrawArea = ref(false)

// 可手动输入的高德 key 与安全密钥
const manualKey = ref((import.meta as any).env?.VITE_AMAP_KEY || '')
const manualSecurityCode = ref((import.meta as any).env?.VITE_AMAP_SECURITY_CODE || '')

// AMap 运行时对象
let map: any = null
let mouseTool: any = null
let polygon: any = null
let polyline: any = null
let polygonEditor: any = null
let AMapSDK: any = null

// 版本戳：用于忽略旧异步回调（清空/重绘后晚到的事件）
let stateVersion = 0
let refreshTimer: ReturnType<typeof setTimeout> | null = null

// 根据高度和重叠率计算航线条带间距（米）
const spacingMeters = computed(() => {
  const safeHeight = clamp(height.value, 20, 500)
  const safeOverlap = clamp(lateralOverlapRate.value, 10, 90)
  const spaceScale = lerp(1, 4, safeHeight / 500)
  return lerp(90, 3, safeOverlap / 100) * spaceScale
})

const canStartDraw = computed(() => isReady.value && !hasDrawArea.value)

// 参数变化后，若已有绘制区域则实时重算航线
watch([height, lateralOverlapRate, mainCourseAngle], () => {
  if (polygon && isReady.value) {
    refreshRouteByPolygon()
  }
})

// 生命周期：挂载后初始化地图，卸载前释放资源
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

    mouseTool = new AMapSDK.MouseTool(map)
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
  bumpStateVersion()
  clearPendingRefresh()
  disposePolygonEditor()
  clearRoute()
  clearSceneDrawOverlays()

  if (map) {
    map.destroy()
    map = null
  }

  mouseTool = null
  AMapSDK = null
}

const polygonEditorEventNames = ['addnode', 'removenode', 'adjust', 'move', 'end']

const bumpStateVersion = () => {
  stateVersion += 1
}

const clearPendingRefresh = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
}

const removeOverlay = (overlay: any) => {
  if (!overlay || !map) return
  overlay.setMap?.(null)
  map.remove?.(overlay)
}

// 强制清理当前页面所有绘制相关覆盖物，避免二次绘制残留
const clearSceneDrawOverlays = () => {
  if (!map) {
    hasDrawArea.value = false
    return
  }
  const polygons = map.getAllOverlays?.('polygon') || []
  const polylines = map.getAllOverlays?.('polyline') || []
  polygons.forEach((item: any) => removeOverlay(item))
  polylines.forEach((item: any) => removeOverlay(item))
  polygon = null
  polyline = null
  hasDrawArea.value = false
}

const scheduleRefreshRoute = (delay = 0) => {
  const version = stateVersion
  clearPendingRefresh()
  refreshTimer = setTimeout(() => {
    if (version !== stateVersion) return
    refreshRouteWithRetry(3)
  }, delay)
}

// 绘制结束回调：绑定为命名函数，便于统一解绑
const onPolygonDrawEnd = (e: any) => {
  // 首个面完成后立刻退出绘制模式，禁止左键直接起第二个
  mouseTool?.off?.('draw', onPolygonDrawEnd)
  mouseTool?.close?.()

  const obj = e?.obj
  if (!obj) {
    clearRoute()
    return
  }

  // 仅保留当前新绘制对象，清掉其余残留图形
  const polygons = map?.getAllOverlays?.('polygon') || []
  polygons.forEach((item: any) => {
    if (item !== obj) removeOverlay(item)
  })

  polygon = obj
  hasDrawArea.value = true
  enablePolygonEdit()
  // 等待路径写入完成后再计算，避免“刚绘制完无航线”
  scheduleRefreshRoute(0)
}

// 统一的编辑回调，避免重复绑定匿名函数无法解绑
const onPolygonEdited = () => {
  scheduleRefreshRoute(20)
}

// 关闭并解绑编辑器事件，避免旧编辑事件导致航线“回弹”
const disposePolygonEditor = () => {
  if (!polygonEditor) return

  polygonEditorEventNames.forEach((eventName) => {
    polygonEditor.off?.(eventName, onPolygonEdited)
  })
  polygonEditor.setTarget?.(null)
  polygonEditor.close()
  polygonEditor = null
}

const startDrawPolygon = () => {
  if (!mouseTool || !isReady.value || hasDrawArea.value) return

  // 新一轮绘制，先提升版本，防止旧回调污染
  bumpStateVersion()
  clearPendingRefresh()

  // 切换到新绘制前，先清掉旧编辑状态和旧图形
  disposePolygonEditor()
  clearRoute()
  clearSceneDrawOverlays()

  mouseTool.close?.()
  mouseTool.off?.('draw', onPolygonDrawEnd)
  mouseTool.polygon({
    strokeColor: '#3388ff',
    strokeWeight: 2,
    strokeOpacity: 1,
    fillColor: '#3388ff',
    fillOpacity: 0.25,
    zIndex: 10
  })

  mouseTool.once('draw', onPolygonDrawEnd)
}

const enablePolygonEdit = () => {
  if (!map || !polygon || !AMapSDK) return

  disposePolygonEditor()

  polygonEditor = new AMapSDK.PolygonEditor(map, polygon)
  polygonEditor.open()

  polygonEditorEventNames.forEach((eventName) => {
    polygonEditor.on(eventName, onPolygonEdited)
  })
}

// 清空航线相关覆盖物与统计数据
const clearRoute = () => {
  routeCount.value = 0
  routeDistanceMeters.value = 0
  if (polyline && map) {
    removeOverlay(polyline)
    polyline = null
  }
}

const clearAll = () => {
  // 清空视为新状态，屏蔽旧异步回调
  bumpStateVersion()
  clearPendingRefresh()

  // 先停编辑事件，再清图形，避免“清空后航线又出现”
  disposePolygonEditor()
  mouseTool?.off?.('draw', onPolygonDrawEnd)
  mouseTool?.close?.()
  clearRoute()
  clearSceneDrawOverlays()
  hasDrawArea.value = false
}

// 按当前多边形与参数重新计算并绘制航线
const refreshRouteByPolygon = (): boolean => {
  if (!polygon || !AMapSDK || !map || !isReady.value) return false
  hasDrawArea.value = true

  const rawPath = polygon.getPath?.() || []
  const points: LngLatPoint[] = normalizePathPoints(rawPath)

  if (points.length < 3) {
    clearRoute()
    return false
  }

  const route = buildLawnmowerRoute(points, spacingMeters.value, mainCourseAngle.value)

  if (!route.length) {
    clearRoute()
    return false
  }

  routeCount.value = route.length
  routeDistanceMeters.value = calculateRouteDistance(route)

  if (polyline) {
    removeOverlay(polyline)
  }

  polyline = new AMapSDK.Polyline({
    path: route,
    strokeColor: '#f59e0b',
    strokeWeight: 3,
    strokeOpacity: 0.95,
    showDir: true,
    zIndex: 20
  })

  map.add(polyline)
  return true
}

const refreshRouteWithRetry = (retry = 3) => {
  const success = refreshRouteByPolygon()
  if (success || retry <= 0) return
  const version = stateVersion
  setTimeout(() => {
    if (version !== stateVersion) return
    refreshRouteWithRetry(retry - 1)
  }, 80)
}

// 兼容不同 path 点结构（LngLat 对象 / 普通对象 / 数组）
function normalizePathPoints(rawPath: any[]): LngLatPoint[] {
  const points: LngLatPoint[] = []
  rawPath.forEach((item: any) => {
    const lng = item?.lng ?? item?.getLng?.() ?? item?.[0]
    const lat = item?.lat ?? item?.getLat?.() ?? item?.[1]
    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      points.push([Number(lng), Number(lat)])
    }
  })
  return points
}

function buildLawnmowerRoute(polygonPoints: LngLatPoint[], stepMeters: number, angleDeg: number): LngLatPoint[] {
  if (polygonPoints.length < 3) return []

  const origin = getCentroid(polygonPoints)
  const angleRad = (angleDeg * Math.PI) / 180

  const xyPoints = polygonPoints.map((p) => toLocalXY(p, origin))
  const rotated = xyPoints.map((p) => rotatePoint(p, -angleRad))
  const closed = closePolygon(rotated)

  const xList = closed.map((p) => p[0])
  const minX = Math.min(...xList)
  const maxX = Math.max(...xList)

  const step = Math.max(5, stepMeters)
  const output: XYPoint[] = []
  let reverse = false

  for (let x = minX + step / 2; x <= maxX; x += step) {
    const intersections = getIntersectionsWithVerticalLine(closed, x)
    if (intersections.length < 2) continue

    intersections.sort((a, b) => a - b)

    for (let i = 0; i < intersections.length - 1; i += 2) {
      const p1: XYPoint = [x, intersections[i]]
      const p2: XYPoint = [x, intersections[i + 1]]

      if (reverse) {
        output.push(p2, p1)
      } else {
        output.push(p1, p2)
      }

      reverse = !reverse
    }
  }

  return dedupeRoute(
    output
      .map((p) => rotatePoint(p, angleRad))
      .map((p) => toLngLat(p, origin))
  )
}

function getCentroid(points: LngLatPoint[]): LngLatPoint {
  const lng = points.reduce((sum, p) => sum + p[0], 0) / points.length
  const lat = points.reduce((sum, p) => sum + p[1], 0) / points.length
  return [lng, lat]
}

function toLocalXY(point: LngLatPoint, origin: LngLatPoint): XYPoint {
  const [lng, lat] = point
  const [lng0, lat0] = origin
  const lat0Rad = (lat0 * Math.PI) / 180
  const x = (lng - lng0) * 111320 * Math.cos(lat0Rad)
  const y = (lat - lat0) * 110540
  return [x, y]
}

function toLngLat(point: XYPoint, origin: LngLatPoint): LngLatPoint {
  const [x, y] = point
  const [lng0, lat0] = origin
  const lat0Rad = (lat0 * Math.PI) / 180
  const lng = lng0 + x / (111320 * Math.cos(lat0Rad))
  const lat = lat0 + y / 110540
  return [lng, lat]
}

function rotatePoint(point: XYPoint, angleRad: number): XYPoint {
  const [x, y] = point
  const cos = Math.cos(angleRad)
  const sin = Math.sin(angleRad)
  return [x * cos - y * sin, x * sin + y * cos]
}

function closePolygon(points: XYPoint[]): XYPoint[] {
  if (!points.length) return points
  const first = points[0]
  const last = points[points.length - 1]
  if (first[0] === last[0] && first[1] === last[1]) return points
  return [...points, first]
}

function getIntersectionsWithVerticalLine(points: XYPoint[], x: number): number[] {
  const ys: number[] = []

  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i]
    const [x2, y2] = points[i + 1]

    if (x1 === x2) continue

    const minX = Math.min(x1, x2)
    const maxX = Math.max(x1, x2)
    if (x < minX || x >= maxX) continue

    const t = (x - x1) / (x2 - x1)
    ys.push(y1 + t * (y2 - y1))
  }

  return ys
}

function dedupeRoute(route: LngLatPoint[]): LngLatPoint[] {
  if (!route.length) return route
  const result: LngLatPoint[] = [route[0]]
  for (let i = 1; i < route.length; i++) {
    const prev = result[result.length - 1]
    const cur = route[i]
    if (Math.abs(prev[0] - cur[0]) > 1e-8 || Math.abs(prev[1] - cur[1]) > 1e-8) {
      result.push(cur)
    }
  }
  return result
}

function lerp(a: number, b: number, t: number): number {
  const safe = clamp(t, 0, 1)
  return a + (b - a) * safe
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
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

// 统一解析 AMap 初始化异常信息
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

.field {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #334155;
}

.field input {
  width: 84px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 4px 6px;
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
  margin-top: 6px;
}

.help {
  margin-top: 10px;
  font-size: 12px;
  color: #475569;
}
</style>
