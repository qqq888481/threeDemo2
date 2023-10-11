<script setup>
import { reactive, ref, onMounted } from 'vue'
import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

let renderer, scene, camera;
let stats, meshKnot;
const ThreeRef = ref()

const init = () => {

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 5, - 15);

    scene = new THREE.Scene()
    RectAreaLightUniformsLib.init()
    const width = 10;
    const height = 10;
    const intensity = 1;
    const rectLight = new THREE.RectAreaLight(0xffffff, intensity, width, height);
    rectLight.position.set(5, 5, 0);
    rectLight.lookAt(0, 0, 0);
    scene.add(rectLight)

    // rectLightHelper = new RectAreaLightHelper( rectLight );
    // scene.add( rectLightHelper );
    // scene.background=new THREE.Color().setHSL(0.2,0.2,1);
    const rectLight1 = new THREE.RectAreaLight(0xff0000, 5, 4, 10)
    rectLight1.position.set(-5, 5, 5)
    scene.add(rectLight1)

    // const rectLight2=new THREE.RectAreaLight(0x00ff00,5,4,10);
    // rectLight2.position.set(0,5,5)
    // scene.add(rectLight2)

    // const rectLight3=new THREE.RectAreaLight(0x0000ff,5,4,10)
    // rectLight3.position.set(5,5,5)
    // scene.add(rectLight3)

    // scene.add(new RectAreaLightHelper(rectLight1))
    // scene.add(new RectAreaLightHelper(rectLight2))
    // scene.add(new RectAreaLightHelper(rectLight3))

    const geoFloor = new THREE.BoxGeometry(2000, 0.1, 2000);
    const matStdFloor = new THREE.MeshStandardMaterial({ color: 0xbcbcbc, roughness: 0.1, metalness: 0 });
    const mshStdFloor = new THREE.Mesh(geoFloor, matStdFloor);
    scene.add(mshStdFloor);

    const geoKnot = new THREE.TorusKnotGeometry(1.5, 0.5, 200, 16);
    const matKnot = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0, metalness: 0 });
    meshKnot = new THREE.Mesh(geoKnot, matKnot);
    meshKnot.position.set(0, 5, 0);
    scene.add(meshKnot);


    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animation);
    ThreeRef.value.appendChild(renderer.domElement)
    window.addEventListener('resize', onWindowResize)

}

const onWindowResize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = (window.innerWidth / window.innerHeight)
    camera.updateProjectionMatrix()
}

const animation = () => {


    // meshKnot.rotation.x=time/1000
    renderer.render(scene, camera)
}

onMounted(() => {
    init()
})



</script>
<template>
    <div ref="ThreeRef"></div>
</template>