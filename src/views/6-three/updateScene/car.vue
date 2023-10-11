<script setup>
import { ref, reactive, onMounted } from 'vue'
import * as THREE from 'three'
import Stats from 'three/addons/libs/stats.module.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
const ThreeRef = ref()
let camera, scene, renderer
let stats
let grid
let controls
const wheels = []

const init = () => {
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  // renderer.setAnimationLoop(render)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.85
  ThreeRef.value.appendChild(renderer.domElement)
  window.addEventListener('resize', onWindowResize)

  stats = new Stats()
  ThreeRef.value.appendChild(stats.dom)

  //camera
  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(4.25, 1.4, -4.5)

  //controls
  controls = new OrbitControls(camera, renderer.domElement)
  // controls.autoRotate = true
  // controls.autoRotateSpeed = 1.0
  controls.maxDistance = 9
  // controls.keyPanSpeed = 6.0
  controls.maxPolarAngle = THREE.MathUtils.degToRad(90)
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN
  }
  controls.target.set(0, 0.5, 0)

  controls.update()

  //scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x333333)
  scene.environment = new RGBELoader().load('./data/gltf/venice_sunset_1k.hdr')
  scene.environment.mapping = THREE.EquirectangularReflectionMapping
  scene.fog = new THREE.Fog(0x333333, 10, 15)

  //grid
  grid = new THREE.GridHelper(10, 20, 0xffffff, 0xffffff)
  grid.material.opacity = 0.2
  grid.material.depthWrite = false
  grid.material.transparent = true
  scene.add(grid)
  renderer.setAnimationLoop(render)

  //materials
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xff0000,
    metalness: 1.0,
    roughness: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03
  })
  const detailsMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 1.0, //材质与金属的相似度

    roughness: 0.5 //该纹理的绿色通道用于改变材质的粗糙度
  })

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.25,
    roughness: 0,
    transmission: 1.0
  })
  const bodyColorInput = document.getElementById('body-color')
  bodyColorInput.addEventListener('input', function () {
    bodyMaterial.color.set(this.value)
  })
  const detailsColorInput = document.getElementById('details-color')
  detailsColorInput.addEventListener('input', function () {
    detailsMaterial.color.set(this.value)
  })
  const glassColorInput = document.getElementById('glass-color')
  glassColorInput.addEventListener('input', function () {
    glassColorInput.color.set(this.value)
  })

  //Car
  const shadow = new THREE.TextureLoader().load('./data/gltf/ferrari_ao.png')

  const loader = new GLTFLoader()
  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('./data/draco/gltf/')
  loader.setDRACOLoader(dracoLoader)
  loader.load('./data/gltf/ferrari.glb', function (gltf) {
    const carModel = gltf.scene.children[0]
    console.log(carModel, '模型')
    carModel.getObjectByName('body').material = bodyMaterial
    carModel.getObjectByName('rim_fl').material = detailsMaterial
    carModel.getObjectByName('rim_fr').material = detailsMaterial
    carModel.getObjectByName('rim_rr').material = detailsMaterial
    carModel.getObjectByName('rim_rl').material = detailsMaterial
    carModel.getObjectByName('trim').material = detailsMaterial

    carModel.getObjectByName('glass').material = glassMaterial

    wheels.push(
      carModel.getObjectByName('wheel_fl'),
      carModel.getObjectByName('wheel_fr'),
      carModel.getObjectByName('wheel_rl'),
      carModel.getObjectByName('wheel_rr')
    )

    //shadow
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.655 * 4, 1.3 * 4),
      new THREE.MeshBasicMaterial({
        //这种材质不受光照的影响
        map: shadow, //颜色贴图
        blending: THREE.MultiplyBlending,
        toneMapped: false,
        transparent: true
      })
    )
    mesh.rotation.x = -Math.PI / 2
    mesh.renderOrder = 2
    carModel.add(mesh)
    scene.add(carModel)
  })
}

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
const render = () => {
  controls.update()
  const time = -performance.now() / 1000
  for (let i = 0; i < wheels.length; i++) {
    wheels[i].rotation.x = time * Math.PI * 2
  }
  grid.position.z = -time % 1
  renderer.render(scene, camera)
  stats.update()
}
onMounted(() => {
  init()
})
</script>
<template>
  <!-- <div class="container"></div> -->
  <div ref="ThreeRef"></div>
  <div id="info">
    <div class="colorPicker"><input id="body-color" type="color" value="#ff0000" /><br />Body</div>
    <div class="colorPicker"><input id="details-color" type="color" value="#ffffff" /><br />Details</div>
    <div class="colorPicker"><input id="glass-color" type="color" value="#ffffff" /><br />Glass</div>
  </div>
</template>
<style lang="scss" scoped>
.container {
  width: 100vw;
  height: 100vh;
}
#info {
  position: absolute;
  display: flex;

  top: 50rem;
  left: 50%;
  transform: translate(-50%, -50%);
  .colorPicker {
    margin-right: 30rem;
  }
}
</style>
