import { createRouter, createWebHashHistory } from 'vue-router'

// 真实的路由嵌套结构
export const routes = [
  {
    path: '/:pathMatch(.*)',
    redirect: '/'
  },
  {
    path: '/',
    name: 'three',
    redirect: '/font',
    component: () => import('@/views/6-three/index.vue'),
    children: [
   
      {
        path: 'font', //字体
        name: 'font',
        component: () => import('@/views/6-three/font/index.vue')
      },
      {
        path:'Scene',
        name:'Scene',
        component:()=>import('@/views/6-three/Scene/index.vue'),
        redirect:'/Scene/fog',
        children:[
          {
            path:'fog',
            name:'fog',
            component:()=>import('@/views/6-three/Scene/fog.vue')
          }
        ]
      },
      {
        path: 'materialModel',
        name: 'materialModel',
        redirect:'/materialModel/materialShow',
        component:()=>import('@/views/6-three/material/index.vue'),
        children:[
         
          {
            path:'materialShow',
            name:'materialShow',
            component:()=>import('@/views/6-three/material/materialShow.vue')
          },
        ]
      },
      {
        path:'loader',
        name:'loader',
        redirect:'/loader/draco',
        component:()=>import('@/views/6-three/Loader/index.vue'),
        children:[
          {
            path:'draco',
            name:'draco',

            component:()=>import('@/views/6-three/Loader/draco.vue')
          }
        ]
      },
      {
        path:'effects',
        name:'effects',
        component:()=>import('@/views/6-three/effects/stereo.vue')
      },
      {
        path: 'Light',
        name: 'Light',
        redirect: '/Light/LightTest',
        component: () => import('@/views/6-three/Light/index.vue'),

        children: [
          
          {
            path: 'LightTest',
            name: 'LightTest',
            redirect: '/Light/LightTest/areaLightTest',
            component: () => import('@/views/6-three/Light/Test/index.vue'),
            children: [
              {
                path: 'areaLightTest', //平面光
                name: 'areaLightTest',
                component: () => import('@/views/6-three/Light/Test/areaLight.vue')
              },
              // {
              //   path: 'spotLightTest',//聚光灯,
              //   name: 'spotLightTest',
              //   component: () => import('@/views/6-three/Light/Test/spotLight.vue')
              // }
            ]
          }
        ]
      }
    ]
  }
]

// 创建的路由示例
export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})
