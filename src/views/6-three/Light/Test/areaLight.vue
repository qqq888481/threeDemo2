<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
let camera, scene, renderer, circleGeo
const ThreeRef = ref()
const init = () => {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(-3, 5, -30);
    scene = new THREE.Scene;

    RectAreaLightUniformsLib.init()

    const rectLight1 = new THREE.RectAreaLight(0xff0000, 5, 8, 10);
    rectLight1.position.set(- 5, 5, 5);
    scene.add(rectLight1);
    scene.add(new RectAreaLightHelper(rectLight1));

    const rectLight2 = new THREE.RectAreaLight(0xffff00, 5, 8, 10);
    rectLight2.position.set(- 16, 5, 0);
    rectLight2.rotation.y=-Math.PI/2
    scene.add(rectLight2);
    scene.add(new RectAreaLightHelper(rectLight2));

    const rectLight3 = new THREE.RectAreaLight(0x0000ff, 5, 8, 10);
    rectLight3.position.set(6, 5, 0);
    rectLight3.rotation.y=Math.PI/2
    scene.add(rectLight3);
    scene.add(new RectAreaLightHelper(rectLight3));


    const geoFloor = new THREE.BoxGeometry(2000, 0.1, 2000);
    const matStdFloor = new THREE.MeshStandardMaterial({ color: 0xbcbcbc, roughness: 0.1, metalness: 0 });
    const mshStdFloor = new THREE.Mesh(geoFloor, matStdFloor);
    scene.add(mshStdFloor);

    // 创建材质
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true, // 透明度设置为 true
        opacity: 0.5, // 设置透明度
        roughness: 0,
        metalness: 0,
        envMapIntensity: 1,
        transmission: 0.95, // 折射度，表示光线经过材料时的衰减程度
        clearcoat: 1,
        clearcoatRoughness: 0,
        refractionRatio: 1.5, // 折射率，控制光的折射程度
    });

    // 创建物体1
    const glassGeometry = new THREE.BoxGeometry(5, 5, 5);
    const glass = new THREE.Mesh(glassGeometry, glassMaterial);
    glass.position.y = 5
    glass.position.x = -5
    scene.add(glass)

    //创建物体2
    const circlegeometry = new THREE.SphereBufferGeometry(2, 20, 20)
    //加载贴图
    const textureLoader = new THREE.TextureLoader()
    const texture = textureLoader.load('./data/textures/haizeiwang.png')
    const material = new THREE.MeshBasicMaterial({
        color: 0xb9d3ff
    })
    material.map = texture
    circleGeo = new THREE.Mesh(circlegeometry, material)
    circleGeo.position.set(-5, 5, 0)
    scene.add(circleGeo)

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    ThreeRef.value.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.addEventListener('change', render)
  controls.minDistance = 10
  controls.maxDistance = 50
    window.addEventListener('resize', onWindowResize) 
    animate()
}
const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}
const animate = () => {
    requestAnimationFrame(animate)
    circleGeo.rotation.x += 0.005
    circleGeo.rotation.y += 0.01
    render()
}
const render=()=>{
    renderer.render(scene, camera)
}
onMounted(() => {
    init()
}
)
</script>
<template>
    <div ref="ThreeRef"></div>
</template>