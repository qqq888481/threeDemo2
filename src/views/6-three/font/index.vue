<script setup>
import { ref, reactive, onMounted } from 'vue'
import * as THREE from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
const threeRef = ref()
const scene = new THREE.Scene()
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
//Font
let group, textMesh1, textMesh2, textGeo, materials
let camera, cameraTarget
//加载字体并显示---这种特效可以用来做登录页
const showText = () => {
  scene.background = new THREE.Color(0xf0f0f0)
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.set(0, -400, 600)
  const loader = new FontLoader()
  const font = loader.load(
    //资源url
    './data/droid_sans_bold.typeface.json',
    //onload回调
    function (font) {
      const color = 0x006699

      const matDark = new THREE.LineBasicMaterial({
        color: color,
        side: THREE.DoubleSide
      })

      const matLite = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      })

      const message = 'happy.'

      const shapes = font.generateShapes(message, 100)

      const geometry = new THREE.ShapeGeometry(shapes)

      geometry.computeBoundingBox()

      const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x)

      geometry.translate(xMid, 0, 0)

      // make shape ( N.B. edge view not visible )

      const text = new THREE.Mesh(geometry, matLite)
      text.position.z = -150
      scene.add(text)

      // make line shape ( N.B. edge view remains visible )

      const holeShapes = []

      for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i]

        if (shape.holes && shape.holes.length > 0) {
          for (let j = 0; j < shape.holes.length; j++) {
            const hole = shape.holes[j]
            holeShapes.push(hole)
          }
        }
      }

      shapes.push.apply(shapes, holeShapes)

      const lineText = new THREE.Object3D()

      for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i]

        const points = shape.getPoints()
        const geometry = new THREE.BufferGeometry().setFromPoints(points)

        geometry.translate(xMid, 0, 0)

        const lineMesh = new THREE.Line(geometry, matDark)
        lineText.add(lineMesh)
      }

      scene.add(lineText)

      threeRef.value.appendChild(renderer.domElement)
      renderer.render(scene, camera)
    },
    //onProgreess回调
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    //onError回调
    function (err) {
      console.log('An error happended')
    }
  )
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 0, 0)
  controls.update()

  controls.addEventListener('change', render)

  window.addEventListener('resize', onWindowResize)
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

const fontClass = reactive({
  font: null,
  showFont2: () => {
    
    //camera
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1500)
    camera.position.set(0, 400, 700)
    cameraTarget = new THREE.Vector3(0, 150, 0)

    //Scene
    scene.background = new THREE.Color(0x000000)
    scene.fog = new THREE.Fog(0x000000, 250, 1400)

    //LIGHTS
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.4)
    dirLight.position.set(0, 0, 1).normalize()
    scene.add(dirLight)

    const pointLight = new THREE.PointLight(0xffffff, 4.5, 0, 0)
    pointLight.color.setHSL(Math.random(), 1, 0.5)
    pointLight.position.set(0, 100, 90)
    scene.add(pointLight)

    materials = [
      new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true }), //font
      new THREE.MeshPhongMaterial({ color: 0xffffff }) //side
    ]
    group = new THREE.Group()
    group.position.y = 100
    scene.add(group)

    fontClass.loadFont()
  },
  loadFont: () => {
    const loader = new FontLoader()
    loader.load(path, function (response) {
      fontClass.font = response
      fontClass.refreshText()
    })
  },
  refreshText: () => {
    group.remove(textMesh1)
    if (mirror) group.remove(textMesh2)
  }
})
onMounted(() => {
  showText()
  // fontClass.showFont2()
})
</script>
<template>
  <div ref="threeRef" class="container"></div>
</template>
<style lang="scss" scoped>
.container {
  width: 100vw;
  height: 100vh;
}
</style>
