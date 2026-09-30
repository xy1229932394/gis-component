import AMapLoader from '@amap/amap-jsapi-loader'

const defaultDemoKey = 'ae29a37307840c7ae4a785ac905927e0'

const NEEDED_PLUGINS = ['AMap.Scale', 'AMap.MouseTool', 'AMap.PolygonEditor', 'AMap.MarkerCluster']

let amapPromise: Promise<any> | null = null
let currentKey = ''
let currentSecurityCode = ''

export function loadAMap(key?: string, securityCode?: string): Promise<any> {
  const finalKey = key || defaultDemoKey
  const finalSecurityCode = securityCode || ''

  if (amapPromise && currentKey === finalKey && currentSecurityCode === finalSecurityCode) {
    return amapPromise
  }

  if (finalSecurityCode) {
    ;(window as any)._AMapSecurityConfig = { securityJsCode: finalSecurityCode }
  }

  currentKey = finalKey
  currentSecurityCode = finalSecurityCode

  const promise = AMapLoader.load({
    key: finalKey,
    version: '2.0',
    plugins: NEEDED_PLUGINS
  })

  amapPromise = promise

  promise.catch(() => {
    amapPromise = null
    currentKey = ''
    currentSecurityCode = ''
  })

  return promise
}

export function preloadAMap(): void {
  const key = (import.meta as any).env?.VITE_AMAP_KEY || ''
  const securityCode = (import.meta as any).env?.VITE_AMAP_SECURITY_CODE || ''
  loadAMap(key, securityCode).catch(() => {})
}
