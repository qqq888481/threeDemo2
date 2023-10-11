<script setup>
import { ref, reactive, onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const ThreeRef = ref()

let camera, scene, renderer
const init = () => {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 0, 40);
    scene = new THREE.Scene;

    //物体
     
    const circlegeometry = new THREE.PlaneGeometry(60,30)
    //加载贴图
    const textureLoader = new THREE.TextureLoader()
    const texture = textureLoader.load('./data/textures/floor.png')
   
    const material = new THREE.MeshBasicMaterial({
        color: 0xb9d3ff
    })
    material.map = texture
    const circleGeo = new THREE.Mesh(circlegeometry, material)
    circleGeo.position.set(0, 0, 5)
    circleGeo.rotation.x=-Math.PI/3
    scene.add(circleGeo)


    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    ThreeRef.value.appendChild(renderer.domElement)
     
   animate()
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.addEventListener('change', render)
  controls.minDistance = 10
  controls.maxDistance = 50

    
   
}
 const animate=()=>{
    requestAnimationFrame(animate)
    render()
 }
const render=()=>{
    renderer.render(scene, camera)
}

onMounted(() => {
    init()
})
</script>
<template>
    <div ref="ThreeRef"></div>
</template>