<script setup>
import { ref, onMounted } from 'vue'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
//import { SceneUtils } from 'three/addons/utils/SceneUtils.js';
import * as THREE from 'three'
let camera, scene, renderer, controls;
const ThreeRef = ref()
const init = () => {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000)
    camera.position.set(-1.3, 0, 1.0)

    scene = new THREE.Scene

    //
    new RGBELoader().load('./data/gltf/venice_sunset_1k.hdr', function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping //等矩形反射映射

      scene.background = texture
      scene.environment = texture
      

      //简单的网络材质:MeshBasicMaterial.MeshDepthMaterial,MeshNormalMaterial
      //MeshBasicMaterial
      const cubeGeometry=new THREE.BoxGeometry(0.2,0.2,0.2)
      const cubeMaterial=new THREE.MeshBasicMaterial({ envMap: texture })
      const cube=new THREE.Mesh(cubeGeometry,cubeMaterial)
      cube.position.set(0.5,0,-1)
      scene.add(cube)

      //联合材质  MeshDepthMaterial,MeshNormalMaterial两种结合在一起
    //   const cubeGeometry2=new THREE.BoxGeometry(0.2,0.2,0.2)
    //   const cubeMaterial2=new THREE.MeshDepthMaterial()
    //   const colorMaterial=new THREE.MeshBasicMaterial({
    //     color:0xffff00,
    //     transparent:true,
    //     blending:THREE.MultiplyBlending//指定融合模式
    //   })
    //   const cube2=new SceneUtils.createMultiMaterialObject(cubeGeometry2, [cubeMaterial2, colorMaterial2])
    //   cube2.position.set(2,0,-1)
    //   scene.add(cube2)

    //THREE.MeshNormalMaterial   一种法向量材质
     const sphereGeometry=new THREE.SphereGeometry(0.1,20,20)
     const sphereMaterial=new THREE.MeshNormalMaterial({
        flatShading:true //方便我们看到各个面的颜色
     })
     const sphereMesh=new THREE.Mesh(sphereGeometry,sphereMaterial)
     scene.add(sphereMesh)

     //高级材质
    //MeshLambert
    const torusGeometry=new THREE.TorusKnotGeometry(0.1,0.1,100,6)
    torusGeometry.computeVertexNormals() 
    const torusMaterial=new THREE.MeshLambertMaterial({ envMap: texture,flatShading:true,emissive:'#fff'})
    const torusMesh=new THREE.Mesh(torusGeometry,torusMaterial)
    torusMesh.position.set(-0.5,0,1)
    scene.add(torusMesh)
     
    //加载模型


     render()
    })
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setAnimationLoop(render)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1 //色调映射的曝光级别
    ThreeRef.value.appendChild(renderer.domElement)

    controls = new OrbitControls( camera, renderer.domElement );
  controls.addEventListener('change', render)
  window.addEventListener('resise',onWindowResize)

}
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
    init()
})
</script>
<template>
    <div ref="ThreeRef"></div>
</template>