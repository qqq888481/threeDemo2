<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const ThreeRef = ref()
let controls, camera, scene, renderer;
let textureEquirec, textureCube;
let sphereMesh, sphereMaterial;

const init = () => {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.set(0, 0, 2.5)

    //Scene
    scene = new THREE.Scene();

    //textures
    const loader = new THREE.CubeTextureLoader();

    textureCube = loader.load(['./data/textures/posx.jpg', './data/textures/negx.jpg', './data/textures/posy.jpg', './data/textures/negy.jpg', './data/textures/posz.jpg', './data/textures/negz.jpg'])


    const textureLoader = new THREE.TextureLoader()
    textureEquirec = textureLoader.load('./data/textures/2294472375_24a3b8ef46_o.jpg')
   // textureEquirec.mapping = THREE.EquirectangularRefractionMapping;  //玻璃一样的
    textureEquirec.mapping = THREE.EquirectangularReflectionMapping;   //金属的映射
    textureEquirec.colorSpace = THREE.SRGBColorSpace
   
    scene.background = textureCube

    //geometry
    const geometry = new THREE.IcosahedronGeometry(1,15);
    sphereMaterial = new THREE.MeshBasicMaterial({ envMap: textureCube });
    sphereMesh = new THREE.Mesh(geometry, sphereMaterial);
    scene.add(sphereMesh);

    window.addEventListener('resize', onWindowResize)

    //render
    renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    ThreeRef.value.appendChild(renderer.domElement)

    //
    controls=new OrbitControls(camera,renderer.domElement)
    controls.minDistance=1.5;
    controls.maxDistance=6

    //
    const params={
        Cube:function(){
            scene.background=textureCube;
            sphereMaterial.envMap=textureCube;
            sphereMaterial.needsUpdate=true
        },
        Equirerectangular:function(){
            scene.background = textureEquirec;

sphereMaterial.envMap = textureEquirec;
sphereMaterial.needsUpdate = true;
        },
        Refraction:false
    }


    const gui=new GUI()
    gui.add(params,'Cube')
    gui.add(params,'Equirerectangular')
    gui.add(params,'Refraction').onChange(function(value){
        if(value){
            textureEquirec.mapping=THREE.EquirectangularRefractionMapping;//折射--透明
            textureCube.mapping=THREE.CubeReflectionMapping
        }else{
            textureEquirec.mapping=THREE.EquirectangularRefractionMapping;
            textureEquirec.mapping=THREE.CubeReflectionMapping
        }
        sphereMaterial.needsUpdate=true
    }) 
    gui.open()

    animate()

}

const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)
}

const animate = () => {
    requestAnimationFrame(animate)
    render()
}

const render = () => {
    camera.lookAt(scene.position)
    renderer.render(scene, camera)
}


onMounted(() => {
    init()
})


</script>
<template>
    <div ref="ThreeRef" class="container"></div>
</template>
<style lang="scss" scoped></style>