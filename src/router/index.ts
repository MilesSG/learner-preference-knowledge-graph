import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue')
  },
  {
    path: '/knowledge-graph',
    name: 'KnowledgeGraph',
    component: () => import('../views/KnowledgeGraph.vue')
  },
  {
    path: '/learning-path',
    name: 'LearningPath',
    component: () => import('../views/LearningPathView.vue'),
    meta: {
      title: '学习路径',
      requiresAuth: true
    }
  },
  {
    path: '/resources',
    name: 'Resources',
    component: () => import('../views/Resources.vue'),
    meta: {
      title: '学习资源'
    }
  },
  {
    path: '/preference-settings',
    name: 'PreferenceSettings',
    component: () => import('../views/PreferenceSettings.vue'),
    meta: {
      title: '学习偏好设置'
    }
  },
  {
    path: '/preference-list',
    name: 'PreferenceList',
    component: () => import('../views/PreferenceList.vue'),
    meta: {
      title: '我的学习偏好'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = typeof to.meta.title === 'string' 
    ? `${to.meta.title} - 基于学习偏好的知识图谱` 
    : '基于学习偏好的知识图谱'
  next()
})

export default router 