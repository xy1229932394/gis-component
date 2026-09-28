const fs = require('fs')
const s = fs.readFileSync('src/utils/scatter.ts', 'utf8')
const cm = s.match(/CITY_COORDINATES[\s\S]*?PROVINCE_COORDINATES/)
const cbody = cm[0]
const cMap = {}
for (const mm of cbody.matchAll(/'([^']+)':\s*\[([\d.,\s]+)\]/g)) {
  cMap[mm[1]] = mm[2]
}

const pm = s.match(/PROVINCE_COORDINATES[\s\S]*?\n}/)
const pbody = pm[0]
const pMap = {}
for (const mm of pbody.matchAll(/'([^']+)':\s*\[([\d.,\s]+)\]/g)) {
  pMap[mm[1]] = mm[2]
}

const src = fs.readFileSync('E:/hongdun/hongdun-client/src/components/largeScreen/ChinaMap.vue', 'utf8')
const scm = src.match(/cityCoordinates: \{[\s\S]*?\n      \}/)
const scbody = scm[0]
const scMap = {}
for (const mm of scbody.matchAll(/'([^']+)':\s*\[([\d.,\s]+)\]/g)) {
  scMap[mm[1]] = mm[2]
}

const spm = src.match(/provinceCoordinates: \{[\s\S]*?\n      \}/)
const spbody = spm[0]
const spMap = {}
for (const mm of spbody.matchAll(/'([^']+)':\s*\[([\d.,\s]+)\]/g)) {
  spMap[mm[1]] = mm[2]
}

const diffCity = Object.keys(scMap).filter(k => scMap[k].replace(/\s/g, '') !== (cMap[k] || '').replace(/\s/g, ''))
const diffProv = Object.keys(spMap).filter(k => spMap[k].replace(/\s/g, '') !== (pMap[k] || '').replace(/\s/g, ''))
console.log('CITY value diffs:', JSON.stringify(diffCity))
console.log('PROVINCE value diffs:', JSON.stringify(diffProv))
