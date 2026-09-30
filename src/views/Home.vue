<template>
  <div class="home-container">
    <canvas ref="particleCanvas" class="bg-canvas"></canvas>

    <div class="bg-grid"></div>
    <div class="bg-glow glow-1"></div>
    <div class="bg-glow glow-2"></div>
    <div class="bg-glow glow-3"></div>
    <div class="bg-pulse"></div>

    <el-card class="menu-card" shadow="hover">
      <div class="menu-content">
        <h1 class="title">GIS 航线绘制</h1>
        <p class="subtitle">选择一种航线绘制模式进入</p>

        <div class="menu-list">
          <div class="menu-item" @click="goTo('/amap-area')">
            <div class="menu-icon">
              <el-icon :size="30" color="#409eff"><MapLocation /></el-icon>
            </div>
            <div class="menu-info">
              <div class="menu-name">绘面航线</div>
              <div class="menu-desc">在地图上绘制多边形区域，自动生成割草机式航线</div>
            </div>
            <el-icon class="menu-arrow" color="#909399"><ArrowRight /></el-icon>
          </div>

          <div class="menu-item" @click="goTo('/gis-marker')">
            <div class="menu-icon">
              <el-icon :size="30" color="#67c23a"><Location /></el-icon>
            </div>
            <div class="menu-info">
              <div class="menu-name">绘点航线</div>
              <div class="menu-desc">在地图上依次点击添加航点，自动连线生成航线</div>
            </div>
            <el-icon class="menu-arrow" color="#909399"><ArrowRight /></el-icon>
          </div>

          <div class="menu-item" @click="goTo('/amap-scatter')">
            <div class="menu-icon">
              <el-icon :size="30" color="#9370db"><Connection /></el-icon>
            </div>
            <div class="menu-info">
              <div class="menu-name">聚和撒点</div>
              <div class="menu-desc">按品类在地图上撒点，支持聚合展示与信息弹窗</div>
            </div>
            <el-icon class="menu-arrow" color="#909399"><ArrowRight /></el-icon>
          </div>

          <div class="menu-item" @click="goTo('/amap-model')">
            <div class="menu-icon">
              <el-icon :size="30" color="#e6a23c"><Box /></el-icon>
            </div>
            <div class="menu-info">
              <div class="menu-name">3D模型</div>
              <div class="menu-desc">古浪电站与中赢风电场老子云3D模型沉浸式展示</div>
            </div>
            <el-icon class="menu-arrow" color="#909399"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Box, Connection, Location, MapLocation } from '@element-plus/icons-vue'

const router = useRouter()

const goTo = (path: string) => {
  router.push(path)
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

const particleCanvas = ref<HTMLCanvasElement | null>(null)

let ctx: CanvasRenderingContext2D | null = null
let rafId = 0
let particles: Particle[] = []
let canvasWidth = 0
let canvasHeight = 0

const PARTICLE_COUNT = 70
const LINK_DISTANCE = 130

const initParticles = () => {
  const canvas = particleCanvas.value
  if (!canvas) return
  canvasWidth = canvas.width = window.innerWidth
  canvasHeight = canvas.height = window.innerHeight

  particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    r: Math.random() * 1.8 + 0.8
  }))
}

const drawFrame = () => {
  const canvas = particleCanvas.value
  if (!canvas || !ctx) return

  const c = ctx

  c.clearRect(0, 0, canvasWidth, canvasHeight)

  particles.forEach((p) => {
    p.x += p.vx
    p.y += p.vy
    if (p.x < 0 || p.x > canvasWidth) p.vx *= -1
    if (p.y < 0 || p.y > canvasHeight) p.vy *= -1
  })

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i]
      const b = particles[j]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < LINK_DISTANCE) {
        const opacity = (1 - dist / LINK_DISTANCE) * 0.35
        c.strokeStyle = `rgba(94, 170, 255, ${opacity})`
        c.lineWidth = 1
        c.beginPath()
        c.moveTo(a.x, a.y)
        c.lineTo(b.x, b.y)
        c.stroke()
      }
    }
  }

  particles.forEach((p) => {
    c.beginPath()
    c.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    c.fillStyle = 'rgba(140, 200, 255, 0.85)'
    c.fill()
  })

  rafId = requestAnimationFrame(drawFrame)
}

const handleResize = () => {
  initParticles()
}

onMounted(() => {
  const canvas = particleCanvas.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  initParticles()
  drawFrame()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', handleResize)
  ctx = null
  particles = []
})
</script>

<style scoped>
.home-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  overflow: hidden;
  background: radial-gradient(ellipse at 20% 20%, #12294a 0%, #0b1a33 45%, #060d1c 100%);
}

.bg-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.bg-grid {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image:
    linear-gradient(rgba(80, 150, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(80, 150, 255, 0.06) 1px, transparent 1px);
  background-size: 52px 52px;
  -webkit-mask-image: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.85), transparent 78%);
  mask-image: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.85), transparent 78%);
}

.bg-glow {
  position: absolute;
  z-index: 0;
  border-radius: 50%;
  filter: blur(72px);
  opacity: 0.5;
  animation: glowFloat 14s ease-in-out infinite alternate;
  pointer-events: none;
}

.glow-1 {
  width: 480px;
  height: 480px;
  top: -140px;
  left: -120px;
  background: radial-gradient(circle, rgba(64, 158, 255, 0.5), transparent 70%);
}

.glow-2 {
  width: 420px;
  height: 420px;
  bottom: -160px;
  right: -100px;
  background: radial-gradient(circle, rgba(103, 194, 58, 0.38), transparent 70%);
  animation-delay: 4s;
}

.glow-3 {
  width: 340px;
  height: 340px;
  top: 42%;
  left: 60%;
  background: radial-gradient(circle, rgba(94, 129, 244, 0.45), transparent 70%);
  animation-delay: 8s;
}

@keyframes glowFloat {
  from {
    transform: translate(0, 0) scale(1);
  }
  to {
    transform: translate(36px, 28px) scale(1.15);
  }
}

.bg-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 240px;
  height: 240px;
  z-index: 0;
  border: 2px solid rgba(64, 158, 255, 0.4);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: pulseRing 3.2s ease-out infinite;
  pointer-events: none;
}

.bg-pulse::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 2px solid rgba(103, 194, 58, 0.35);
  border-radius: 50%;
  animation: pulseRing 3.2s ease-out 1.6s infinite;
}

@keyframes pulseRing {
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 0.9;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.9);
    opacity: 0;
  }
}

.menu-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 720px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(13, 26, 48, 0.72);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
}

.menu-content {
  padding: 28px 12px 20px;
}

.title {
  font-size: 32px;
  font-weight: bold;
  color: #eaf2ff;
  margin: 0 0 8px;
  letter-spacing: 1px;
  text-shadow: 0 2px 18px rgba(64, 158, 255, 0.45);
}

.subtitle {
  font-size: 14px;
  color: #8fa8cc;
  margin: 0 0 32px;
}

.menu-list {
  display: grid;
  gap: 16px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.04);
  transition:
    border-color 0.25s,
    box-shadow 0.25s,
    transform 0.25s,
    background 0.25s;
}

.menu-item:hover {
  border-color: rgba(64, 158, 255, 0.65);
  background: rgba(64, 158, 255, 0.1);
  box-shadow:
    0 6px 22px rgba(64, 158, 255, 0.28),
    inset 0 0 24px rgba(64, 158, 255, 0.06);
  transform: translateY(-2px);
}

.menu-icon {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.menu-info {
  flex: 1;
}

.menu-name {
  font-size: 18px;
  font-weight: 600;
  color: #eaf2ff;
  margin-bottom: 6px;
}

.menu-desc {
  font-size: 13px;
  color: #8fa8cc;
}

.menu-arrow {
  flex-shrink: 0;
  transition: transform 0.25s;
}

.menu-item:hover .menu-arrow {
  transform: translateX(4px);
}
</style>
