# Checklist

- [x] `public/data/new-map-data.json` 已存在且内容与源项目一致
- [x] `public/data/power-station.json` 已存在且内容与源项目一致
- [x] `public/data/map-data.json` 含 `tabs` 字段（已去除 光伏发电/风力发电/储能）
- [x] `src/assets/imags/zcdpIcon/` 下品类 PNG 图标已就位（16 个，删除未使用的 bg.png 背景大图）
- [x] `src/utils/scatter.ts` 导出 CITY_COORDINATES / PROVINCE_COORDINATES / parseRegion / getCityCoordinates / convertNewMapData / convertPowerStationData / formatNumber
- [x] 撒点算法满足：同地区首点居中、两点距离 ≥1km（0.0083 度）、1000 次尝试 + 螺旋 fallback
- [x] `src/views/GisScatter/AmapScatter.vue` 使用 `loadAMap` 初始化地图（darkblue、zoom 5、center [106.27, 38.47]）
- [x] 品类 tab 多选筛选生效，选「全部」显示资产+电站全部数据
- [x] `绿电交通/绿电装备/其他装备/三一装备` 品类使用 MarkerClusterer 聚合，其余直接展示
- [x] hover 显示 InfoWindow（资产/电站两种格式），移出关闭
- [x] 路由 `/amap-scatter-preview` 已注册并指向 AmapScatter.vue
- [x] 首页 Home.vue 出现「聚和撒点」菜单入口，点击可跳转
- [x] `npm run build` 通过（vue-tsc + vite 无 error）
- [x] 浏览器访问 `/amap-scatter-preview` 页面正常渲染、地图可交互
