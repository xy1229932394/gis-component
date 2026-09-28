# 聚和撒点 功能提取 Spec

## Why
gis-component 是地图组件项目，目前首页只有「绘面航线」「绘点航线」两个入口。用户希望从鸿盾资产管理大屏项目（`E:\hongdun\hongdun-client`）的 `RealTimeMonitor.vue` 中提取地图「聚合撒点」能力，在首页新增一个「聚和撒点」入口。

## What Changes
- 首页 `Home.vue` 新增第 3 个块状菜单「聚和撒点」，点击跳转新路由 `/amap-scatter-preview`
- 新增路由指向新页面组件
- 从源项目 `ChinaMap.vue`（撒点+聚合模式，`RealTimeMonitor.vue` 中使用的核心地图组件）提取功能：
  - 品类 tab 多选筛选（默认「全部」）
  - 随机撒点算法（同地区内任意两点 ≥1km，1000 次尝试 + 螺旋 fallback）
  - 资产数据（new-map-data.json）+ 电站数据（power-station.json）双数据源
  - AMap.MarkerClusterer 聚合（仅 `clusteredTypes` 品类聚合，其余直接展示）
  - 品类图标 Marker + InfoWindow 信息弹窗
- 静态资源复制到 gis-component：
  - `public/data/new-map-data.json`（资产数据，完整复制）
  - `public/data/power-station.json`（电站数据，完整复制）
  - `public/data/map-data.json`（仅提取 `tabs` 字段，源组件仅使用该字段；源文件 205KB 中大量 markers 数组未被使用，不复刻）
  - `src/assets/imags/zcdpIcon/*.png`（18 个品类图标，完整复制）
- 技术栈适配：Vue2 Options API + vue-amap → Vue3 `<script setup>` + TS + 现有 `@/utils/amap` 的 `loadAMap()`
- 类型适配：新增 `src/utils/scatter.ts` 纯函数工具模块（随机撒点算法 + 地区解析 + 坐标查找 + 城市坐标表）
- 样式适配：保持源项目深蓝大屏风格（darkblue 地图样式、品类 tab、信息弹窗样式）

**BREAKING**: 无（纯新增功能，不影响现有绘面/绘点航线）

## Impact
- Affected specs: 无现有 spec 关联
- Affected code:
  - `src/router/index.ts`（新增路由）
  - `src/views/Home.vue`（新增菜单入口）
  - 新增 `src/views/GisScatter/AmapScatter.vue`（页面组件）
  - 新增 `src/utils/scatter.ts`（撒点算法工具）
  - 新增 `public/data/*.json`（静态数据）
  - 新增 `src/assets/imags/zcdpIcon/*.png`（图标资源）

## ADDED Requirements

### Requirement: 首页「聚和撒点」菜单入口
系统 SHALL 在首页菜单列表新增「聚和撒点」块状菜单，点击后跳转 `/amap-scatter-preview`。

#### Scenario: 成功进入
- **WHEN** 用户在首页点击「聚和撒点」菜单
- **THEN** 路由跳转到 `/amap-scatter-preview` 页面并加载聚合撒点地图

### Requirement: 聚合撒点地图页面
系统 SHALL 提供聚合撒点页面，具备以下能力：
- 品类 tab 多选筛选（默认「全部」；选「全部」时显示资产+电站全部数据）
- 随机撒点：同地区首个点位于市中心，后续点随机分布在半径 `1km * sqrt(n)` 范围内，任意两点距离 ≥1km；1000 次尝试失败后回退螺旋排列
- 聚合展示：`绿电交通/绿电装备/其他装备/三一装备` 品类使用 `AMap.MarkerClusterer` 聚合（maxZoom 10, gridSize 80），其余品类直接展示
- 信息弹窗：hover 标记点显示 InfoWindow（资产：地区/承租人/资产分类/租赁物类别/租赁本金/资产余额；电站：电站名称/地区/电站类型/装机容量）
- 地图初始化：AMap JSAPI 2.0、darkblue 样式、zoom 5、center `[106.27, 38.47]`、可缩放 3-18

#### Scenario: 品类筛选
- **WHEN** 用户点击某个品类 tab
- **THEN** 地图标记点更新为对应品类的数据点，聚合状态随之更新

#### Scenario: 悬停查看详情
- **WHEN** 用户鼠标悬停在标记点/聚合点上
- **THEN** 显示对应业务数据信息弹窗，鼠标移出后关闭

### Requirement: 随机撒点算法工具模块
系统 SHALL 提供纯函数工具模块 `src/utils/scatter.ts`，包含：
- `convertNewMapData(data)`：资产数据 → 标记点格式（金额元→万元）
- `convertPowerStationData(data)`：电站数据 → 标记点格式
- `parseRegion(region)`：地区字符串 → {province, city, county}
- `getCityCoordinates(city, province, cityCoords, provinceCoords)`：坐标查找（市→省→中国中心兜底 `[104, 30]`）
- 城市坐标表 `CITY_COORDINATES` / 省级坐标表 `PROVINCE_COORDINATES`（从源项目复制）
- `formatNumber(value, digits)`：数字格式化

#### Scenario: 资产数据转换
- **WHEN** 传入 new-map-data.json 的资产数据
- **THEN** 返回含 location/type/region/lessee/leasePrincipal/assetBalance/leaseType/values 的标记点数组，金额转为万元

#### Scenario: 电站数据转换
- **WHEN** 传入 power-station.json 的电站数据
- **THEN** 返回含 stationName/stationType/actualCapacity/installedCapacity/location 的标记点数组

### Requirement: 数据与图标静态资源
系统 SHALL 将以下资源复制到 gis-component：
- `public/data/new-map-data.json`（资产数据，完整）
- `public/data/power-station.json`（电站数据，完整）
- `public/data/map-data.json`（仅 `tabs` 字段）
- `src/assets/imags/zcdpIcon/*.png`（18 个品类图标）

#### Scenario: 数据加载
- **WHEN** 页面挂载后加载三个数据文件及图标
- **THEN** tabs 列表、资产标记点、电站标记点就绪并渲染地图
