<script setup>
import{reactive,ref,onMounted} from 'vue'
import * as THREE from 'three'
import Stats from 'three/addons/libs/stats.module.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const ThreeRef=ref()
let camera,scene,renderer;
const mixers=[];
let stats;
const clock=new THREE.Clock();
const init=()=>{
    camera=new THREE.PerspectiveCamera(30,window.innerWidth/window.innerHeight,1,5000)
    camera.position.set(0,0,250)

    scene=new THREE.Scene()
    scene.background=new THREE.Color().setHSL(0.6,0,1);
   // scene.background=new THREE.Color(0xffffff)
    scene.fog=new THREE.Fog(scene.background,1,5000)

    //Light
    const hemiLight=new THREE.HemisphereLight( 0xffffbb, 0x080820,2)//半球光
    hemiLight.color.setHSL(1,1,0.6)
    hemiLight.groundColor.setHSL(0.095,1,0.75)
    hemiLight.position.set(0,50,0)
    scene.add(hemiLight)

    const hemiLightHelper=new THREE.HemisphereLightHelper(hemiLight,10) //半球光辅助器
    scene.add(hemiLightHelper)

    const dirLight=new THREE.DirectionalLight(0xffffff,3)
    dirLight.color.setHSL(0.1,1,0.95)
    dirLight.position.set(-1,1.75,1)
    dirLight.position.multiplyScalar(30)
    scene.add(dirLight)

    dirLight.castShadow=true;
    dirLight.shadow.mapSize.width=2048;
    dirLight.shadow.mapSize.height=2048;
   
    const d=50;
    dirLight.shadow.camera.left=-d;
    dirLight.shadow.camera.right=d;
    dirLight.shadow.camera.top=d;
    dirLight.shadow.camera.bottom=-d;

    dirLight.shadow.camera.far=3500;
    dirLight.shadow.bias=-0.0001;

    const dirLightHelper=new THREE.DirectionalLightHelper(dirLight,10)
    scene.add(dirLightHelper)


    //Ground
    const groundGeo=new THREE.PlaneGeometry(10000,10000)
    const groundMat=new THREE.MeshLambertMaterial({color:0xffffff})
    groundMat.color.setHSL(0.095,1,0.75)
    const ground=new THREE.Mesh(groundGeo,groundMat)
    ground.position.y=-33;
    ground.position.x=-Math.PI/2;
    ground.rotation.x=-Math.PI/2;
    ground.receiveShadow=true;
    scene.add(ground)

    //skyMode
    var vertexShader=`
         varying vec3 vWorldPosition;
         void main(){
            vec4 worldPosition=modelMatrix * vec4(position,1.0);
            vWorldPosition=worldPosition.xyz;
            gl_Position=projectionMatrix * modelViewMatrix*vec4(position,1.0);
         }
    `
    var fragmentShader=`
         uniform vec3 topColor;
         uniform vec3 bottomColor;
         uniform float offset;
         uniform float exponent;

         varying vec3 vWorldPosition;

         void main(){
            float h=normalize(vWorldPosition + offset).y;
            gl_FragColor=vec4(mix(bottomColor,topColor,max(pow(max(h,0.0),exponent),0.0)),1.0);

         }
    `
    const uniforms={
        'topColor':{value:new THREE.Color(0x0077ff)},
        'bottomColor':{value:new THREE.Color(0xffffff)},
        'offset':{value:33},
        'exponent':{value:0.6}
    }
    uniforms['topColor'].value.copy(hemiLight.color);
    scene.fog.color.copy(uniforms['bottomColor'].value)
    const skyGeo=new THREE.SphereGeometry(4000,32,15);
    const skyMat=new THREE.ShaderMaterial({
        uniforms:uniforms,
        vertexShader:vertexShader,
        fragmentShader:fragmentShader,
        side:THREE.BackSide
    })
    const sky=new THREE.Mesh(skyGeo,skyMat);
    scene.add(sky)

    //Model
    const loader=new GLTFLoader()
    loader.load('./data/gltf/Flamingo.glb',function(gltf){
        console.log(gltf,gltf.scene.children,gltf.scene.children[0],'模型')
        const mesh=gltf.scene.children[0];
        const s=0.35;
        mesh.scale.set(s,s,s)
        mesh.position.y=15;
        mesh.rotation.y=-1;
        mesh.castShadow=true;
        scene.add(mesh)

        const mixer=new THREE.AnimationMixer(mesh)
        mixer.clipAction(gltf.animations[0]).setDuration(1).play();
        mixers.push(mixer)
    })


    renderer=new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth,window.innerHeight)
    ThreeRef.value.appendChild(renderer.domElement)
    renderer.shadowMap.enabled=true;

    //stats
    stats=new Stats()
    ThreeRef.value.appendChild(stats.dom)
    animate()
}
const animate=()=>{
    requestAnimationFrame(animate)
    render()
    stats.update()
}
const render=()=>{
    const delta=clock.getDelta();
    for(let i=0;i<mixers.length;i++){
        mixers[i].update(delta)
    }
    renderer.render(scene,camera)
}
onMounted(()=>{
    init()
})

</script>
<template>
    <div ref="ThreeRef">

    </div>
</template>