<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
const ThreeRef = ref()
let camera, scene, renderer,controls;
const init = () => {
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000)
  camera.position.set(0, 0, 0.2)

  scene = new THREE.Scene()
  scene.background=new THREE.Color(0x333333)
  scene.fog=new THREE.Fog(0x333333, 10, 15)
  // //light
  const light = new THREE.AmbientLight(0xffffff)
  scene.add(light)

  const directionalLight=new THREE.DirectionalLight(0xffffff,0.5)
  scene.add(directionalLight)



  //loader
  const loader = new GLTFLoader()
  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('./data/draco/')
  loader.setDRACOLoader(dracoLoader)

  loader.load('./data/glb/girl.glb', function (gltf) {
    // console.log(gltf,'模型信息')
    scene.add(gltf.scene)
  })

 
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setAnimationLoop(render)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  ThreeRef.value.appendChild(renderer.domElement)


  controls = new OrbitControls( camera, renderer.domElement );
  controls.addEventListener('change', render)
}
const render = () => {
  renderer.render(scene,camera)
}
onMounted(() => {
  init()
})
</script>
<template>
  <div ref="ThreeRef"></div>
</template>