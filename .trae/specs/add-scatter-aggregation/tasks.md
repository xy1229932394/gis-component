# Tasks

- [x] Task 1: 复制静态资源到 gis-component
  - [x] 1.1 复制 `new-map-data.json` 到 `public/data/`
  - [x] 1.2 复制 `power-station.json` 到 `public/data/`
  - [x] 1.3 从 `map-data.json` 提取 `tabs` 字段，生成精简版 `public/data/map-data.json`
  - [x] 1.4 复制 `zcdpIcon/*.png`（16 个图标，删除未使用的 bg.png 背景大图）到 `src/assets/imags/zcdpIcon/`
- [x] Task 2: 创建撒点算法工具模块 `src/utils/scatter.ts`
  - [x] 2.1 复制城市/省级坐标表（CITY_COORDINATES / PROVINCE_COORDINATES）
  - [x] 2.2 实现 `parseRegion` / `getCityCoordinates` / `formatNumber`
  - [x] 2.3 实现 `convertNewMapData` / `convertPowerStationData`（随机撒点 + 螺旋 fallback）
- [x] Task 3: 创建聚合撒点页面 `src/views/GisScatter/AmapScatter.vue`
  - [x] 3.1 Vue3 `<script setup>` + TS 结构，使用 `@/utils/amap` 的 `loadAMap`
  - [x] 3.2 地图初始化（darkblue、zoom 5、center [106.27, 38.47]、zooms 3-18）
  - [x] 3.3 品类 tab 多选筛选 UI 与逻辑
  - [x] 3.4 标记点创建（品类图标）+ MarkerClusterer 聚合
  - [x] 3.5 InfoWindow 信息弹窗（资产/电站两种格式）
  - [x] 3.6 深蓝大屏风格样式（tab、信息窗、页面布局）
- [x] Task 4: 路由与首页菜单
  - [x] 4.1 路由新增 `/amap-scatter-preview` → AmapScatter.vue
  - [x] 4.2 首页 Home.vue 新增「聚和撒点」块状菜单入口（含图标）
- [x] Task 5: 构建验证
  - [x] 5.1 运行 `npm run build` 通过（vue-tsc + vite）
  - [x] 5.2 浏览器访问 `/amap-scatter-preview` 页面正常渲染

# Task Dependencies
- Task 3 依赖 Task 1、Task 2
- Task 4 依赖 Task 3
- Task 5 依赖 Task 1-4
