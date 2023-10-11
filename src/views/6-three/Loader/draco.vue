<script setup>
import{ref,reactive,onMounted} from 'vue'

import * as THREE from 'three'
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js'
let camera,scene,renderer,dracoLoader,lightHelper;

const ThreeRef=ref()
const init=()=>{
   dracoLoader=new DRACOLoader()
   dracoLoader.setDecoderPath('./data/draco/')
   dracoLoader.setDecoderConfig({type:'js'})//使用js方式解压

   camera=new THREE.PerspectiveCamera(35,window.innerWidth/window.innerHeight,0.1,1000)
   camera.position.set(3,0.25,3)

   scene=new THREE.Scene()
   scene.background=new THREE.Color(0x443333);
   scene.fog=new THREE.Fog(0x443333,1,4);

   //Groud
   const floorMat= new THREE.MeshPhongMaterial({color:0xcbcbcb,specular:0x101010})
   const textureLoader = new THREE.TextureLoader()
  textureLoader.load('./data/textures/hardwood2_diffuse.jpg', function (map) {
    map.wrapS = THREE.RepeatWrapping
    map.wrapT = THREE.RepeatWrapping
    map.anisotropy = 4
    map.repeat.set(10, 24)
    map.colorSpace = THREE.SRGBColorSpace
    floorMat.map = map
    floorMat.needsUpdate = true
  })
  
 
   const plane=new THREE.Mesh(
    new THREE.PlaneGeometry(8,8),
    floorMat
   )
   plane.rotation.x=-Math.PI/2;
   plane.position.y=0.03;
   plane.receiveShadow=true;
   scene.add(plane);

   //Lights
   const hemiLight=new THREE.HemisphereLight(0x8d7c7c,0x494966,1)  //半球光，不能投射阴影
   scene.add(hemiLight)
   let spotTexture
   

   const spotLight=new THREE.SpotLight()
   spotLight.intensity=1;
   spotLight.angle=Math.PI/20;
   spotLight.penumbra=0.5;
   spotLight.castShadow=true;
   spotLight.position.set(-1,3,1)
   
				spotLight.decay = 2;
   textureLoader.load('./data/textures/negz.jpg',function(map){
    map.minFilter = THREE.LinearFilter;
    map.magFilter = THREE.LinearFilter;
    map.colorSpace = THREE.SRGBColorSpace;
    console.log(map,'图片')
    spotLight.map=map
    //色儿好像不对  不知道是哪的问题
   })
   scene.add(spotLight);
   lightHelper = new THREE.SpotLightHelper( spotLight );
				scene.add( lightHelper );
   dracoLoader.load('./data/draco/gltf/bunny.drc',function(geometry){
    console.log(geometry,'物体')
      geometry.computeVertexNormals()
      const material=new THREE.MeshStandardMaterial({color:0xa5a5a5})
      const mesh=new THREE.Mesh(geometry,material)
      mesh.castShadow=true;
      mesh.receiveShadow=true;
      scene.add(mesh)

      dracoLoader.dispose()
   })

   //render
   renderer=new THREE.WebGLRenderer({antialias:true})
   renderer.setPixelRatio(window.devicePixelRatio)
   renderer.setSize(window.innerWidth,window.innerHeight)
   renderer.shadowMap.enabled=true;
   
   ThreeRef.value.appendChild(renderer.domElement)

   
    window.addEventListener('resize',onWindowResize)

   animate()
}

const onWindowResize=()=>{
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth,window.innerHeight)
}

const animate=()=>{
    render()
    requestAnimationFrame(animate)
}

const render=()=>{
     const timer=Date.now()* 0.0003;

    camera.position.x = Math.sin( timer ) * 0.5;
			camera.position.z = Math.cos( timer ) * 0.5;
			camera.lookAt( 0, 0.1, 0 );
            lightHelper.update()
    renderer.render(scene,camera)
}


onMounted(()=>{
    init()
})
</script>
<template>
    <div ref="ThreeRef"></div>
</template>
<style>

</style>