<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import Stats from 'three/addons/libs/stats.module.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js'
const ThreeRef = ref()
let container, stats;
let camera, scene, renderer;
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

const init = () => {
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 100000)
    camera.position.z = -4000;

    //
    const r = './data/textures/Park3Med/'

    const urls = [
        r + 'px.jpg', r + 'nx.jpg',
        r + 'py.jpg', r + 'ny.jpg',
        r + 'pz.jpg', r + 'nz.jpg'
    ]

    const textureCube = new THREE.CubeTextureLoader().load(urls)
    textureCube.mapping = THREE.CubeRefractionMapping;//透明的
    
    scene = new THREE.Scene()
    scene.background = textureCube

    //LIGHTS
    const ambient = new THREE.AmbientLight(0xffffff, 3.5)
    scene.add(ambient)

    //material samples
    // const cubeMaterial3=new THREE.MeshPhongMaterial({color:0xccddff,envMap:textureCube,refractionRatio:0.98,reflectivity:0.9})
    // const cubeMaterial2=new THREE.MeshPhongMaterial({color:0xccfffd,envMap:textureCube,refractionRatio:0.985})
    //const cubeMaterial1=new THREE.MeshPhongMaterial({color:0xffffff,envMap:textureCube,refractionRatio:0.98})

    const cubeMaterial3 = new THREE.MeshPhongMaterial({ color: 0xccddff, envMap: textureCube, refractionRatio: 0.98, reflectivity: 0.9 });
    const cubeMaterial2 = new THREE.MeshPhongMaterial({ color: 0xccfffd, envMap: textureCube, refractionRatio: 0.985 });
    const cubeMaterial1 = new THREE.MeshPhongMaterial({ color: 0xffffff, envMap: textureCube, refractionRatio: 0.98 });

    //
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    ThreeRef.value.appendChild(renderer.domElement)

    //
    const loader = new PLYLoader()
    loader.load('./data/models/ply/binary/Lucy100k.ply', function (geometry) {
        createScene(geometry, cubeMaterial1, cubeMaterial2, cubeMaterial3)
    })



    window.addEventListener('mousemove', onDocumentMouseMove)
    window.addEventListener('resize', onWindowResize)
    animate()
}

const createScene = (geometry, m1, m2, m3) => {
    geometry.computeVertexNormals()  //通过面片法向量的平均值计算每个顶点的法向量。可能是因为计算出法向量后才能够折射
    //因为不写这行代码的话模型就是黑色的

    const s = 1.5;

    let mesh = new THREE.Mesh(geometry, m1);
    mesh.scale.x = mesh.scale.y = mesh.scale.z = s;
    scene.add(mesh)

    mesh = new THREE.Mesh(geometry, m2)
    mesh.position.x = -1500;
    mesh.scale.x = mesh.scale.y = mesh.scale.z = s;
    scene.add(mesh)

    mesh = new THREE.Mesh(geometry, m3)
    mesh.position.x = 1500;
    mesh.scale.x = mesh.scale.y = mesh.scale.z = s;
    scene.add(mesh)


}

const onDocumentMouseMove = (event) => {

    mouseX = (event.clientX - windowHalfX) * 4;
    mouseY = (event.clientY - windowHalfY) * 4;
}


const onWindowResize = () => {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight)
}

const animate = () => {
    requestAnimationFrame(animate)
    render()

}

const render = () => {

    camera.position.x += (mouseX - camera.position.x) * .05;
    camera.position.y += (-mouseY - camera.position.y) * .05;
    camera.lookAt(scene.position)
    renderer.render(scene, camera)
}

onMounted(() => {
    init()
})

</script>
<template>
    <div ref="ThreeRef"></div>
</template>