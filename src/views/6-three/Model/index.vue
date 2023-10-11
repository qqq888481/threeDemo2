<script setup>
import { ref, reactive, onMounted } from 'vue'
import * as THREE from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
const threeRef = ref()
const scene = new THREE.Scene()
let camera
let renderer
const model = reactive({
  loadModel: () => {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 20)
    camera.position.set(-1.8, 0.6, 2.7)

    new RGBELoader().load('./data/gltf/san_giuseppe_bridge_2k.hdr', function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping //等矩形反射映射

      scene.background = texture
      scene.environment = texture
      render()

      //model
      const loader = new GLTFLoader()
      loader.load('./data/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf', function (gltf) {
        scene.add(gltf.scene)
        render()
      })
    })
    renderer = new THREE.WebGLRenderer({ antialias: true }) //是否执行抗锯齿
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1 //色调映射的曝光级别

    threeRef.value.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.addEventListener('change', render)
    controls.minDistance = 2
    controls.maxDistance = 10
    controls.target.set(0, 0, -0.2)
    controls.update()
    window.addEventListener('resize', onWindowResize)
  }
})
const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  render()
}
const render = () => {
  renderer.render(scene, camera)
}
onMounted(() => {
  model.loadModel()
})
</script>
<template>
  <div ref="threeRef" class="container"></div>
</template>
<style lang="scss" scoped>
.container {
  width: 100vw;
  height: 100vh;
}
</style>
