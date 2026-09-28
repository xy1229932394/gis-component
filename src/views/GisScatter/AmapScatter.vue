<template>
  <div class="scatter-container">
    <div class="map-tabs">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        :class="['tab-item', { active: activeTabs.includes(index) }]"
        @click="handleTabClick(index)"
      >
        <span class="tab-badge" v-if="tabCounts[tab]">{{ tabCounts[tab] }}</span>
        <img v-if="typeIconMap[tab]" :src="typeIconMap[tab]" class="tab-icon" alt="" />
        <span class="tab-text">{{ tab }}</span>
      </div>
    </div>
    <div ref="mapRef" class="map-container"></div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { loadAMap } from '@/utils/amap'
import {
  convertNewMapData,
  convertPowerStationData,
  formatNumber,
  type AssetMarker,
  type MarkerItem,
  type PowerStationMarker
} from '@/utils/scatter'
import chdIcon from '@/assets/imags/zcdpIcon/chd.png'
import gsycnIcon from '@/assets/imags/zcdpIcon/gsycn.png'
import ldjtIcon from '@/assets/imags/zcdpIcon/ldjt.png'
import ldzbIcon from '@/assets/imags/zcdpIcon/ldzb.png'
import qtzbzzIcon from '@/assets/imags/zcdpIcon/qtzbzz.png'
import syzbzzIcon from '@/assets/imags/zcdpIcon/syzbzz.png'
import zhzhnyIcon from '@/assets/imags/zcdpIcon/zhzhny.png'
import dlcnIcon from '@/assets/imags/zcdpIcon/dlcn.png'
import gfIcon from '@/assets/imags/zcdpIcon/gf.png'
import qtIcon from '@/assets/imags/zcdpIcon/qt.png'
import fdIcon from '@/assets/imags/zcdpIcon/fd.png'
import sdIcon from '@/assets/imags/zcdpIcon/sd.png'
import dzIcon from '@/assets/imags/zcdpIcon/dz.png'

const mapRef = ref<HTMLDivElement | null>(null)
const tabs = ref<string[]>([])
const activeTabs = ref<number[]>([0])
const tabCounts = ref<Record<string, number>>({})

const typeIconMap: Record<string, string> = {
  充换电: chdIcon,
  工商储能: gsycnIcon,
  绿电交通: ldjtIcon,
  绿电装备: ldzbIcon,
  其他装备: qtzbzzIcon,
  三一装备: syzbzzIcon,
  综合智慧: zhzhnyIcon,
  独立储能: dlcnIcon,
  光伏: gfIcon,
  其他: qtIcon,
  风电: fdIcon,
  水电: sdIcon,
  储能电站: chdIcon,
  电站: dzIcon
}

let map: any = null
let markers: any[] = []
let infoWindow: any = null
let mockData: AssetMarker[] = []
let powerStationData: PowerStationMarker[] = []

const handleTabClick = (index: number) => {
  if (index === 0) {
    activeTabs.value = [0]
  } else {
    if (activeTabs.value.includes(0)) {
      activeTabs.value = []
    }
    const tabIndex = activeTabs.value.indexOf(index)
    if (tabIndex > -1) {
      activeTabs.value.splice(tabIndex, 1)
    } else {
      activeTabs.value.push(index)
    }
    if (activeTabs.value.length === 0) {
      activeTabs.value = [0]
    }
  }
  updateMarkers()
}

const loadData = async () => {
  try {
    const originalRes = await fetch('/data/map-data.json')
    const originalData = await originalRes.json()
    const removedTabs = ['光伏发电', '风力发电', '储能']
    tabs.value = (originalData.tabs as string[]).filter((tab) => !removedTabs.includes(tab))

    const res = await fetch('/data/new-map-data.json')
    const data = await res.json()
    mockData = convertNewMapData(data)

    await loadPowerStationData()
  } catch (error) {
    console.error('加载地图数据失败:', error)
  }
}

const loadPowerStationData = async () => {
  try {
    const res = await fetch('/data/power-station.json')
    const data = await res.json()
    powerStationData = convertPowerStationData(data)
    const removedTabs = ['光伏发电', '风力发电', '储能']
    tabs.value = tabs.value.filter((tab) => !removedTabs.includes(tab))
    if (!tabs.value.includes('电站')) {
      const otherIndex = tabs.value.indexOf('其他')
      if (otherIndex !== -1) {
        tabs.value.splice(otherIndex, 0, '电站')
      } else {
        tabs.value.push('电站')
      }
    }
    if (activeTabs.value.length) {
      activeTabs.value = activeTabs.value
        .map((index) => tabs.value[index])
        .filter(Boolean)
        .map((tab) => tabs.value.indexOf(tab))
      if (activeTabs.value.length === 0) {
        activeTabs.value = [0]
      }
    }

    const counts: Record<string, number> = {}
    mockData.forEach((item) => {
      counts[item.type] = (counts[item.type] || 0) + 1
    })
    counts['电站'] = powerStationData.length
    counts['全部'] = mockData.length + powerStationData.length
    tabCounts.value = counts
  } catch (error) {
    console.error('加载电站数据失败:', error)
  }
}

const showInfoWindow = (dataItem: MarkerItem) => {
  let content = ''

  if (dataItem.type === '电站') {
    const station = dataItem as PowerStationMarker
    content = `
      <div class="map-info-window">
        <div class="info-header">
          <span class="info-title">${station.stationName}</span>
        </div>
        <div class="info-content">
          <div class="info-item">
            <span class="item-type">地区</span>
            <span class="item-value">${station.region}</span>
          </div>
          <div class="info-item">
            <span class="item-type">电站类型</span>
            <span class="item-value">${station.stationType}</span>
          </div>
          <div class="info-item">
            <span class="item-type">实际装机容量</span>
            <span class="item-value">${station.actualCapacity} MW</span>
          </div>
          <div class="info-item">
            <span class="item-type">装机容量</span>
            <span class="item-value">${station.installedCapacity} MW</span>
          </div>
        </div>
      </div>
    `
  } else {
    const asset = dataItem as AssetMarker
    content = `
      <div class="map-info-window">
        <div class="info-header">
          <span class="info-title">${asset.region}</span>
        </div>
        <div class="info-content">
          <div class="info-item">
            <span class="item-type">承租人</span>
            <span class="item-value">${asset.lessee || '-'}</span>
          </div>
          <div class="info-item">
            <span class="item-type">资产分类</span>
            <span class="item-value">${asset.type}</span>
          </div>
          ${
            asset.leaseType
              ? `
          <div class="info-item">
            <span class="item-type">租赁物类别</span>
            <span class="item-value">${asset.leaseType}</span>
          </div>
          `
              : ''
          }
          ${
            asset.leasePrincipal
              ? `
          <div class="info-item">
            <span class="item-type">租赁本金</span>
            <span class="item-value">${formatNumber(
              (Number(asset.leasePrincipal) || 0) / 10000,
              2
            )} 万元</span>
          </div>
          `
              : ''
          }
          <div class="info-item">
            <span class="item-type">资产余额</span>
            <span class="item-value">${formatNumber(asset.assetBalance, 2)} 万元</span>
          </div>
        </div>
      </div>
    `
  }

  if (infoWindow) {
    infoWindow.close()
  }

  const AMap = (window as any).AMap
  infoWindow = new AMap.InfoWindow({
    content,
    offset: new AMap.Pixel(0, -20),
    closeWhenClickMap: true
  })

  infoWindow.open(map, dataItem.location)
}

const updateMarkers = () => {
  const AMap = (window as any).AMap

  if (markers.length > 0) {
    markers.forEach((m) => {
      try {
        m.setMap(null)
      } catch (e) {
        /* ignore */
      }
    })
    markers = []
  }

  let filteredData: MarkerItem[] = []
  if (activeTabs.value.includes(0)) {
    filteredData = [...mockData, ...powerStationData]
  } else {
    const selectedTypes = activeTabs.value.map((index) => tabs.value[index])
    const needPowerStation = selectedTypes.includes('电站')
    const otherTypes = selectedTypes.filter((type) => type !== '电站')

    if (needPowerStation) {
      filteredData = [...filteredData, ...powerStationData]
    }
    if (otherTypes.length > 0) {
      const filteredMockData = mockData.filter((item) => otherTypes.includes(item.type))
      filteredData = [...filteredData, ...filteredMockData]
    }
  }

  const iconMap: Record<string, any> = {}
  Object.keys(typeIconMap).forEach((type) => {
    iconMap[type] = new AMap.Icon({
      image: typeIconMap[type],
      size: new AMap.Size(24, 24),
      imageSize: new AMap.Size(24, 24),
      anchor: new AMap.Pixel(12, 12)
    })
  })
  const defaultIcon = new AMap.Icon({
    image: qtIcon,
    size: new AMap.Size(24, 24),
    imageSize: new AMap.Size(24, 24),
    anchor: new AMap.Pixel(12, 12)
  })

  filteredData.forEach((dataItem) => {
    try {
      const icon = iconMap[dataItem.type] || defaultIcon
      const marker = new AMap.Marker({
        position: dataItem.location,
        extData: dataItem,
        icon,
        zIndex: 10
      })

      marker.on('mouseover', () => {
        showInfoWindow(dataItem)
      })

      marker.on('mouseout', () => {
        if (infoWindow) {
          infoWindow.close()
        }
      })

      markers.push(marker)
    } catch (error) {
      console.error('创建标记点失败，数据:', dataItem, '错误:', error)
    }
  })

  map.add(markers)
}

const initMap = async () => {
  const key = (import.meta as any).env?.VITE_AMAP_KEY || ''
  const securityCode = (import.meta as any).env?.VITE_AMAP_SECURITY_CODE || ''
  await loadAMap(key, securityCode)

  const AMap = (window as any).AMap
  if (map) {
    map.destroy()
    map = null
  }
  map = new AMap.Map(mapRef.value, {
    zoom: 5,
    zooms: [3, 18],
    expandZoomRange: true,
    center: [106.27, 38.47],
    viewMode: '2D'
  })

  map.setMapStyle('amap://styles/darkblue')
  ;(window as any).__scatterMap = map

  updateMarkers()
}

onMounted(async () => {
  await loadData()
  await initMap()
})

onBeforeUnmount(() => {
  if (map) {
    map.destroy()
    map = null
  }
  if (infoWindow) {
    infoWindow.close()
    infoWindow = null
  }
  markers = []
})
</script>

<style scoped>
.scatter-container {
  width: 100%;
  height: 100vh;
  position: relative;
  background: #060d1c;
}

.map-tabs {
  position: absolute;
  top: 20%;
  right: 2%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  width: 100px;
  height: 100%;
  z-index: 10;
  opacity: 1;
}

.tab-item {
  position: relative;
  padding: 6px 4px;
  background: rgba(40, 55, 111, 0.5);
  color: #aaa;
  font-size: 11px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 70px;
}

.tab-badge {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
  color: #facc15;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
}

.tab-icon {
  width: 16px;
  height: 16px;
}

.tab-text {
  line-height: 1;
}

.tab-item:hover {
  background: rgba(40, 55, 111, 0.8);
  color: #fff;
}

.tab-item.active {
  background: #3cb371;
  color: #000;
}

.map-container {
  width: 100%;
  height: 100%;
}
</style>

<style>
.map-info-window {
  width: 260px;
  background: rgba(7, 27, 55, 0.95);
  border: 1px solid #00ffff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.map-info-window .info-header {
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  padding-bottom: 8px;
  margin-bottom: 10px;
}

.map-info-window .info-title {
  font-size: 14px;
  font-weight: bold;
  color: #00ffff;
}

.map-info-window .info-content {
  max-height: 250px;
  overflow-y: auto;
}

.map-info-window .info-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 13px;
  color: #fff;
}

.map-info-window .item-type {
  color: #b4c3d6;
}

.map-info-window .item-value {
  color: #ff4d4f;
  font-weight: 600;
}

.amap-info-outer {
  background: transparent !important;
}

.amap-info-content {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
}

.amap-info-sharp {
  border-top-color: #00ffff !important;
}
</style>
