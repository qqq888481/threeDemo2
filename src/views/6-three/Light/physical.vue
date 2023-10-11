<script setup>
import { reactive, ref, onMounted } from 'vue'
import * as THREE from 'three'
import Stats from 'three/addons/libs/stats.module.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'

import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

let camera, scene, renderer, bulbLight, bulbMat, hemiLight, stats
let ballMat, cubeMat, floorMat

let previousShadowMap = false

const bulbLuminousPowers = {
  '110000 1m (1000W)': 110000,
  '3500 1m (300W)': 3500,
  '1700 1m (100W)': 1700,
  '800 1m (60W)': 800,
  '400 1m (40W)': 400,
  '180 1m (25W)': 180,
  '20 1m (4W)': 20,
  Off: 0
}

const hemiLuminousIrradiances = {
  '0.0001 1x (Moonless Night)': 0.0001,
  '0.002 1x (Night Airglow)': 0.002,
  '0.5 1x (Full Moon)': 0.5,
  '3.4 1x (City Twilight)': 3.4,
  '50 1x (Living Room)': 50,
  '100 1x (Very Overcast)': 100,
  '350 1x (Office Room)': 50,
  '400 1x (Sunrise/Sunset)': 400,
  '1000 1x (Overcast)': 1000,
  '18000 1x (Daylight)': 18000,
  '50000 1x (Direct Sun)': 50000
}

const params = {
  shadows: true,
  exposure: 0.68,
  bulbPower: Object.keys(bulbLuminousPowers)[4],
  hemiIrradiance: Object.keys(hemiLuminousIrradiances)[0]
}

const ThreeRef = ref()

const init = () => {
  stats = new Stats()
  ThreeRef.value.appendChild(stats.dom)

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.x = -4
  camera.position.z = 4
  camera.position.y = 2

  scene = new THREE.Scene()

  const bulbGeometry = new THREE.SphereGeometry(0.02, 16, 8)
  bulbLight = new THREE.PointLight(0xffee88, 1, 100, 2)

  bulbMat = new THREE.MeshStandardMaterial({
    emissive: 0xffffee,
    emissiveIntensity: 1,
    color: 0x000000
  })

  bulbLight.add(new THREE.Mesh(bulbGeometry, bulbMat))
  bulbLight.position.set(0, 2, 0)
  bulbLight.castShadow = true
  scene.add(bulbLight)

  hemiLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 0.02)
  scene.add(hemiLight)

  floorMat = new THREE.MeshStandardMaterial({
    roughness: 0.8,
    color: 0xffffff,
    metalness: 0.2,
    bumpScale: 0.0005
  })

  const textureLoader = new THREE.TextureLoader()
  textureLoader.load('./data/textures/hardwood2_diffuse.jpg', function (map) {
    map.wrapS = THREE.RepeatWrapping
    map.wrapT = THREE.RepeatWrapping
    map.anisotropy = 4
    map.repeat.set(10, 24)
    map.colorSpace = THREE.SRGBColorSpace
    floorMat.map = map
    floorMat.needsUpdate = true
  })

  textureLoader.load('./data/textures/hardwood2_bump.jpg', function (map) {
    map.wrapS = THREE.RepeatWrapping
    map.wrapT = THREE.RepeatWrapping
    map.anisotropy = 4
    map.repeat.set(10, 24)
    floorMat.bumpMap = map
    floorMat.needsUpdate = true
  })

  textureLoader.load('./data/textures/hardwood2_roughness.jpg', function (map) {
    map.wrapS = THREE.RepeatWrapping
    map.wrapT = THREE.RepeatWrapping
    map.anisotropy = 4
    map.repeat.set(10, 24)
    floorMat.roughnessMap = map
    floorMat.needsUpdate = true
  })

  cubeMat = new THREE.MeshStandardMaterial({
    roughness: 0.7,
    color: 0xffffff,
    bumpScale: 0.002,
    metalness: 0.2
  })

  textureLoader.load('./data/textures/brick_diffuse.jpg', function (map) {
    map.wrapS = THREE.RepeatWrapping
    map.wrapT = THREE.RepeatWrapping
    map.anisotropy = 4
    map.repeat.set(1, 1)
    map.colorSpace = THREE.SRGBColorSpace
    cubeMat.map = map
    cubeMat.needsUpdate = true
  })

  textureLoader.load('./data/textures/brick_bump.jpg', function (map) {
    map.wrapS = THREE.RepeatWrapping
    map.wrapT = THREE.RepeatWrapping
    map.anisotropy = 4
    map.repeat.set(1, 1)
    cubeMat.bumpMap = map
    cubeMat.needsUpdate = true
  })

  ballMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
    metalness: 1.0
  })

  textureLoader.load('./data/textures/earth_atmos_2048.jpg', function (map) {
    map.anisotropy = 4
    map.colorSpace = THREE.SRGBColorSpace
    ballMat.map = map
    ballMat.needsUpdate = true
  })

  textureLoader.load('./data/textures/earth_specular_2048.jpg', function (map) {
    map.anisotropy = 4
    map.colorSpace = THREE.SRGBColorSpace
    ballMat.metalnessMap = map
    ballMat.needsUpdate = true
  })

  //地板
  const floorGeometry = new THREE.PlaneGeometry(20, 20)
  const floorMesh = new THREE.Mesh(floorGeometry, floorMat)
  floorMesh.receiveShadow = true //之前这一行没有写  然后阴影没有出来
  floorMesh.rotation.x = -Math.PI / 2.0
  scene.add(floorMesh)

  //球体
  const ballGeometry = new THREE.SphereGeometry(0.25, 32, 32)
  const ballMesh = new THREE.Mesh(ballGeometry, ballMat)
  ballMesh.position.set(1, 0.25, 1)
  ballMesh.rotation.y = Math.PI
  ballMesh.castShadow = true
  scene.add(ballMesh)

  //方块
  const boxGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
  const boxMesh = new THREE.Mesh(boxGeometry, cubeMat)
  boxMesh.position.set(-0.5, 0.25, -1)
  boxMesh.castShadow = true
  scene.add(boxMesh)

  const boxMesh2 = new THREE.Mesh(boxGeometry, cubeMat)
  boxMesh2.position.set(0, 0.25, -5)
  boxMesh2.castShadow = true
  scene.add(boxMesh2)

  const boxMesh3 = new THREE.Mesh(boxGeometry, cubeMat)
  boxMesh3.position.set(7, 0.25, 0)
  boxMesh3.castShadow = true
  scene.add(boxMesh3)

  renderer = new THREE.WebGLRenderer()
  renderer.shadowMap.enabled = true
  renderer.toneMapping = THREE.ReinhardToneMapping
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  ThreeRef.value.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.minDistance = 1
  controls.maxDistance = 20

  window.addEventListener('resize', onWindowResize)

  const gui = new GUI()
  gui.add(params, 'hemiIrradiance', Object.keys(hemiLuminousIrradiances))
  gui.add(params, 'bulbPower', Object.keys(bulbLuminousPowers))
  gui.add(params, 'exposure', 0, 1)
  gui.add(params, 'shadows')
  gui.open()

  animate()
}

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}
const animate = () => {
  requestAnimationFrame(animate)
  render()
}
const render = () => {
  renderer.toneMappingExposure = Math.pow(params.exposure, 5.0)
  renderer.shadowMap.enabled = params.shadows
  bulbLight.castShadow = params.shadows

  if (params.shadows !== previousShadowMap) {
    ballMat.needsUpdate = true
    cubeMat.needsUpdate = true
    floorMat.needsUpdate = true
    previousShadowMap = params.shadows
  }

  bulbLight.power = bulbLuminousPowers[params.bulbPower]
  bulbMat.emissiveIntensity = bulbLight.intensity / Math.pow(0.02, 2.0)

  hemiLight.intensity = hemiLuminousIrradiances[params.hemiIrradiance]
  const time = Date.now() * 0.0005
  bulbLight.position.y = Math.cos(time) * 0.75 + 1.25

  renderer.render(scene, camera)
  stats.update()
}
onMounted(() => {
  init()
})
</script>
<template>
  <div ref="ThreeRef"></div>
</template>
<style lang="scss" scoped></style>
