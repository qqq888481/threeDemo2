<script setup>
import { reactive, ref, onMounted } from 'vue'
import * as THREE from 'three'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { LightProbeGenerator } from 'three/addons/lights/LightProbeGenerator.js'

let mesh, renderer, scene, camera
let gui

let lightProde
let directionalLight
let ThreeRef = ref()
const API = {
  lightProbeIntensity: 1.0, //intensity强度
  directionalLightIntensity: 0.6,
  envMapIntensity: 1
}

const init = () => {
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  ThreeRef.value.appendChild(renderer.domElement)

  renderer.toneMapping = THREE.ACESFilmicToneMapping //色调映射---旨在将超高的动态范围HDR转换到我们日常现实的屏幕上的低动态范围LDR的过程
  renderer.physicallyCorrectLights = true //为了使光强更趋于真实的
  //scene
  scene = new THREE.Scene()

  //camera
  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000)
  camera.position.set(0, 0, 30)

  //controls
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.addEventListener('change', render)
  controls.minDistance = 10
  controls.maxDistance = 50
  // controls.enablePan = false

  //prode
  lightProde = new THREE.LightProbe() //光照探针
  scene.add(lightProde)

  //light
  directionalLight = new THREE.DirectionalLight(0xffffff, API.directionalLightIntensity)
  directionalLight.position.set(10, 10, 10)
  scene.add(directionalLight)

  //envmap
  const getCubeUrls = function (prefix, postfix) {
    return [
      prefix + 'px' + postfix,
      prefix + 'nx' + postfix,
      prefix + 'py' + postfix,
      prefix + 'ny' + postfix,
      prefix + 'pz' + postfix,
      prefix + 'nz' + postfix
    ]
  }
  const urls = getCubeUrls('./data/textures/pisa/', '.png')
  new THREE.CubeTextureLoader().load(urls, function (cubeTexture) {
    console.log(cubeTexture, '盒子')
    scene.background = cubeTexture
    lightProde.copy(LightProbeGenerator.fromCubeTexture(cubeTexture))
    const geometry = new THREE.SphereGeometry(5, 64, 32)
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0,
      envMap: cubeTexture,
      envMapIntensity: API.envMapIntensity
    })

    //mesh
    mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    render()
    gui = new GUI({ title: 'Intensity' })
    gui
      .add(API, 'lightProbeIntensity', 0, 1, 0.02)
      .name('light prode')
      .onChange(function () {
        lightProde.intensity = API.lightProbeIntensity
        render()
      })
    gui
      .add(API, 'directionalLightIntensity', 0, 1, 0.02)
      .name('directional light')
      .onChange(function () {
        directionalLight.intensity = API.directionalLightIntensity
        render()
      })

    gui
      .add(API, 'envMapIntensity', 0, 1, 0.02)
      .name('envMap')
      .onChange(function () {
        mesh.material.envMapIntensity = API.envMapIntensity
        render()
      })
    gui
      .add(renderer, 'toneMapping', {
        No: THREE.NoToneMapping,
        Linear: THREE.LinearToneMapping,
        Reinhard: THREE.ReinhardToneMapping,
        Cineon: THREE.CineonToneMapping,
        ACESFilmic: THREE.ACESFilmicToneMapping
      })
      .onFinishChange(() => {
        renderer.toneMapping = Number(renderer.toneMapping)
        render()
      })
  })
  render()
  window.addEventListener('resize', onWindowResize)
}
const onWindowResize = () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  render()
}
const render = () => {
  renderer.render(scene, camera)
}
onMounted(() => {
  init()
})
</script>
<template>
  <div ref="ThreeRef"></div>
</template>
<style lang="scss" scoped></style>
