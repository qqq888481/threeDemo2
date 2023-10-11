<script setup>
import { ref, reactive, onMounted } from 'vue'
import * as THREE from 'three'
import Stats from 'three/addons/libs/stats.module.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
let container, stats, clock, gui, mixer, actions, activeAction, previousAction
let camera, scene, renderer, model, face, dirLight

const api = { state: 'Walking' }
const ThreeRef = ref()

const init = () => {
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 100)
  camera.position.set(-5, 3, 10)
  camera.lookAt(0, 2, 0)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xe0e0e0)
  scene.fog = new THREE.Fog(0xe0e0e0, 20, 100)

  clock = new THREE.Clock()
  //lights
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 1)
  hemiLight.position.set(0, 20, 0)
  scene.add(hemiLight)

  dirLight = new THREE.DirectionalLight(0xffffff, 1)
  dirLight.position.set(0, 20, 10)
  scene.add(dirLight)

  //ground
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false })
  )
  mesh.rotation.x = -Math.PI / 2
  scene.add(mesh)

  const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000)
  grid.material.opacity = 0.2
  grid.material.transparent = true
  scene.add(grid)

  const loader = new GLTFLoader()
  loader.load('./data/gltf/RobotExpressive/RobotExpressive.glb', function (gltf) {
    model = gltf.scene
    console.log(gltf.animations, '动画')
    scene.add(model)
    createGUI(model, gltf.animations)
  })

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  ThreeRef.value.appendChild(renderer.domElement)

  window.addEventListener('resize', onWindowResize)

  //stats
  stats = new Stats()
  ThreeRef.value.appendChild(stats.dom)
  animate()
}

const createGUI = (model, animations) => {
  const states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing']
  const emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp']

  gui = new GUI()
  //改变交互界面的style属性
  gui.domElement.style.top = '20rem'
  gui.domElement.style.right = '20rem'

  //光照
  gui.add(dirLight, 'intensity', 1.0, 2.0).name('点光源强度').step(0.1)

  //模型位置
  gui.add(model.position, 'x', 0, 180)
  gui.add(model.position, 'y', 0, 180)
  gui.add(model.position, 'z', 0, 180)

  //颜色改变
  const obj = {
    color: 0x00ffff
  }
  //.addColor()生成颜色值改变的交互界面
  gui
    .addColor(obj, 'color')
    .name('颜色')
    .onChange(function (value) {
      console.log(value, '改变的颜色值')
    })

  //.add()方法参数3数据类型:数组-->生成交互界面是下拉菜单
  const arrObj = { scale: 0 }
  gui
    .add(arrObj, 'scale', [-100, 0, 100])
    .name('下拉框')
    .onChange(function (value) {})

  //.add()方法参数3数据类型:对象
  const arrObj2 = { scale: 0 }
  gui
    .add(arrObj2, 'scale', {
      left: -100,
      center: 10,
      right: 0
    })
    .name('位置选择')

  //.add()方法参数3数据类型:布尔值-->单选框
  const obj3 = { bool: false }
  gui
    .add(obj3, 'bool')
    .name('是否旋转')
    .onChange(function (value) {})
  //创建gui的分组
  //创建材质子菜单
  const matFolder = gui.addFolder('材质')
  matFolder.close()
  //材质颜色color
  matFolder.addColor(obj, 'color').name('颜色')

  //点光源子菜单
  const pointLightFolder = gui.addFolder('点光源')
  pointLightFolder.add(dirLight, 'intensity', 1.0, 2.0)

  mixer = new THREE.AnimationMixer(model)

  actions = {}

  for (let i = 0; i < animations.length; i++) {
    const clip = animations[i]
    console.log(clip, '剪辑动画')
    const action = mixer.clipAction(clip) //返回所传入的剪辑参数的AnimationAction
    console.log(action, '动画')
    actions[clip.name] = action

    if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {
      action.clampWhenFinished = true
      action.loop = THREE.LoopOnce
    }
  }

  //states

  const statesFolder = gui.addFolder('States')
  const clipCtrl = statesFolder.add(api, 'state').options(states)
  clipCtrl.onChange(function (value) {
    fadeToAction(api.state, 0.5)
  })
  statesFolder.open()

  //emotes

  const emoteFolder = gui.addFolder('Emotes')
  function createEmoteCallback(name) {
    api[name] = function () {
      fadeToAction(name, 0.2)
      mixer.addEventListener('finished', restoreState)
    }
    emoteFolder.add(api, name)
  }

  function restoreState() {
    mixer.removeEventListener('finished', restoreState)
    fadeToAction(api.state, 0.2)
  }

  for (let i = 0; i < emotes.length; i++) {
    createEmoteCallback(emotes[i])
  }
  emoteFolder.open()

  //expressions
  face = model.getObjectByName('Head_4')

  const expressions = Object.keys(face.morphTargetDictionary)
  const expressionFolder = gui.addFolder('Expressions')

  for (let i = 0; i < expressions.length; i++) {
    expressionFolder.add(face.morphTargetInfluences, i, 0, 1, 0.01).name(expressions[i])
  }

  activeAction = actions['Walking']
  activeAction.play()
  expressionFolder.open()
}

const fadeToAction = (name, duration) => {
  previousAction = activeAction
  activeAction = actions[name]

  if (previousAction !== activeAction) {
    previousAction.fadeOut(duration) //清除上个动画
  }
  activeAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(duration).play()
}
const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

const animate = () => {
  const dt = clock.getDelta()
  if (mixer) mixer.update(dt)
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
  stats.update()
}

onMounted(() => {
  init()
})
</script>
<template>
  <div ref="ThreeRef"></div>
</template>
<style lang="scss" scoped></style>
