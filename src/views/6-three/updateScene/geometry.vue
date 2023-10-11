<script setup>
import { ref, reactive, onMounted } from 'vue'
import * as THREE from 'three'
import Stats from 'three/addons/libs/stats.module.js'
import axios from 'axios'
const ThreeRef = ref()
const vertexShaderContent = ref()
const fragmentShaderContent = ref()
let camera, scene, renderer, stats
let sphere, uniforms
let displacement, noise
const init = () => {
  camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.z = 400

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x050505)

  uniforms = {
    amplitude: { value: 1.0 },
    color: { value: new THREE.Color(0xff2200) },
    colorTexture: { value: new THREE.TextureLoader().load('./data/textures/water.jpg') }
  }

  uniforms['colorTexture'].value.wrapS = uniforms['colorTexture'].value.wrapT = THREE.RepeatWrapping

  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShaderContent.value,
    fragmentShader: fragmentShaderContent.value
  })

  const radius = 50,
    segments = 128,
    rings = 64

  const geometry = new THREE.SphereGeometry(radius, segments, rings)

  displacement = new Float32Array(geometry.attributes.position.count)
  noise = new Float32Array(geometry.attributes.position.count)

  for (let i = 0; i < displacement.length; i++) {
    noise[i] = Math.random() * 5
  }

  geometry.setAttribute('displacement', new THREE.BufferAttribute(displacement, 1))

  sphere = new THREE.Mesh(geometry, shaderMaterial)
  scene.add(sphere)

  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)

  ThreeRef.value.appendChild(renderer.domElement)

  stats = new Stats()
  ThreeRef.value.appendChild(stats.dom)

  //
  animate()
  window.addEventListener('resize', onWindowResize)
}
const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
const animate = () => {
  requestAnimationFrame(animate)
  render()
  stats.update()
}
const render = () => {
  const time = Date.now() * 0.01

  sphere.rotation.y = sphere.rotation.z = 0.01 * time

  uniforms['amplitude'].value = 1.5 * Math.sin(sphere.rotation.y * 0.125)
  uniforms['color'].value.offsetHSL(0.0005, 0, 0)

  for (let i = 0; i < displacement.length; i++) {
    displacement[i] = Math.sin(0.2 * i + time)
    noise[i] += 0.5 * (0.5 - Math.random())
    noise[i] = THREE.MathUtils.clamp(noise[i], -5, 5)
    displacement[i] += noise[i]
  }

  sphere.geometry.attributes.displacement.needsUpdate = true
  renderer.render(scene, camera)
}
const getShader = () => {
  axios.all([axios.get('./data/shader/fragmentShader.txt'), axios.get('./data/shader/vertexShader.txt')]).then(
    axios.spread((res1, res2) => {
      fragmentShaderContent.value = res1.data
      vertexShaderContent.value = res2.data
      init()
    })
  )
}
onMounted(() => {
  getShader()
})
</script>

<template>
  <div ref="ThreeRef"></div>
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
