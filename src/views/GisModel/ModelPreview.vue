<template>
  <div class="model-container">
    <div class="model-tabs">
      <div
        v-for="item in modelTabs"
        :key="item.id"
        :class="['tab-item', { active: activeId === item.id }]"
        @click="switchModel(item.id)"
      >
        {{ item.label }}
      </div>
    </div>
    <iframe
      ref="frameRef"
      class="model-frame"
      :src="frameSrc"
      frameborder="0"
      @load="onFrameLoad"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const modelTabs = [
  { id: 'guLang', label: '古浪电站', src: '/libs/model/index.html' },
  { id: 'middleWin', label: '中赢风电场', src: '/libs/model/middleWin.html' }
]

const activeId = ref('guLang')
const frameRef = ref<HTMLIFrameElement | null>(null)

const frameSrc = computed(() => {
  const item = modelTabs.find((t) => t.id === activeId.value)
  return item ? item.src : modelTabs[0].src
})

const baseState = () => ({
  zsEnvMonitorCurrRmData: {
    emHorGlobalRad: '',
    emAtmPre: '',
    emHorDirRad: '',
    emWindSpeed: '',
    emWindDirection: '',
    emAmbTem: '',
    emAmbHum: ''
  },
  zbgy: {},
  svg1: {},
  svg2: {},
  powerPredictInfos: {},
  powerInfoForFifDays: [],
  powerInfoForMonth: [],
  agcAvcPowerCurve: [],
  agcAvcVoltageCurve: []
})

const guLangState = () => ({
  ...baseState(),
  cnList: [
    {
      pcsPaic1: 0,
      pcsPaic2: 0,
      pcsAcAp1: 0,
      pcsAcAp2: 0,
      pcsAcRp1: 0,
      pcsAcRp2: 0,
      soc1: 0,
      soc2: 0
    }
  ]
})

const middleWinState = () => ({
  ...baseState(),
  cnList: {
    WT01: {},
    WT02: {},
    WT03: {},
    WT04: {},
    WT05: {},
    WT06: {},
    WT07: {},
    WT08: {},
    WT09: {},
    WT10: {},
    WT11: {},
    WT12: {},
    WT13: {}
  }
})

const buildMessage = () => {
  return activeId.value === 'guLang' ? guLangState() : middleWinState()
}

const sendMessage = () => {
  const frame = frameRef.value
  if (frame && frame.contentWindow) {
    frame.contentWindow.postMessage({ ...buildMessage() }, '*')
  }
}

const onFrameLoad = () => {
  sendMessage()
}

const switchModel = (id: string) => {
  if (activeId.value === id) return
  activeId.value = id
  const frame = frameRef.value
  if (frame) {
    frame.src = frameSrc.value
  }
}

onBeforeUnmount(() => {
  const frame = frameRef.value
  if (frame) {
    frame.src = 'about:blank'
  }
})
</script>

<style scoped>
.model-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background: #060d1c;
  overflow: hidden;
}

.model-tabs {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  gap: 8px;
  padding: 6px;
  background: rgba(13, 26, 48, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.tab-item {
  padding: 6px 18px;
  font-size: 13px;
  color: #8fa8cc;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.25s;
  user-select: none;
}

.tab-item:hover {
  color: #eaf2ff;
  background: rgba(64, 158, 255, 0.15);
}

.tab-item.active {
  color: #000;
  background: #3cb371;
  font-weight: 600;
}

.model-frame {
  display: block;
  width: 100%;
  height: 100%;
  border: none;
  background: #000;
}
</style>
