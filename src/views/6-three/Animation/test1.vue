<script setup>
import { reactive, ref, onMounted } from 'vue'
import * as THREE from 'three'
import Stats from 'three/addons/libs/stats.module.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
let container, stats, clock, gui, mixer, actions, activeAction, previousAction
let camera, scene, renderer, model, face

const api = { state: 'Walking' }
const ThreeRef = ref()

const init = () => {
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 100)
  camera.position.set(-5, 3, 10)
  camera.lookAt(0, 2, 0)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xe0e0e0)
  scene.fog = new THREE.Fog(0xe0e0e0, 20, 100)

  clock = new THREE.Clock()
  //lights
  const hemLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3)
  hemLight.position.set(0, 20, 0)
  scene.add(hemLight)

  const dirLight = new THREE.DirectionalLight(0xffffff, 3)
  dirLight.position.add(0, 20, 10)
  scene.add(dirLight)

  //ground
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: true })
  )
  mesh.rotation.x = -Math.PI / 2
  scene.add(mesh)

  const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000)
  grid.material.opacity = 0.2
  grid.material.transparent = true
  scene.add(grid)

  const loader = new GLTFLoader()

  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('./data/draco/gltf/')
  loader.setDRACOLoader(dracoLoader)
  loader.load('./data/glb/xichuang.glb', function (gltf) {
    model = gltf.scene
    scene.add(gltf.scene)
    //console.log(gltf, '模型信息')
  })

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  ThreeRef.value.appendChild(renderer.domElement)

  animate()
}
const animate = () => {
  requestAnimationFrame(animate)
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
