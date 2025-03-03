<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  HomeFilled,
  User,
  Connection,
  Share,
  Setting,
  List,
  School
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const navItems = [
  {
    title: '首页',
    path: '/',
    icon: HomeFilled
  },
  {
    title: '知识图谱',
    path: '/knowledge-graph',
    icon: Share
  },
  {
    title: '学习路径',
    path: '/learning-path',
    icon: Connection
  },
  {
    title: '学习资源',
    path: '/resources',
    icon: 'Notebook'
  },
  {
    title: '偏好设置',
    path: '/preference-settings',
    icon: Setting
  },
  {
    title: '我的偏好',
    path: '/preference-list',
    icon: User
  }
]

const isActive = (path: string) => {
  return route.path === path
}
</script>

<template>
  <el-menu
    class="sidebar-menu"
    :default-active="route.path"
    background-color="#1f2937"
    text-color="#fff"
    active-text-color="#409EFF"
  >
    <div class="logo">
      <el-icon size="24"><School /></el-icon>
      <span>学习偏好系统</span>
    </div>

    <el-menu-item 
      v-for="item in navItems"
      :key="item.path"
      :index="item.path"
      @click="router.push(item.path)"
    >
      <el-icon><component :is="item.icon" /></el-icon>
      <span>{{ item.title }}</span>
    </el-menu-item>
  </el-menu>
</template>

<style scoped>
.sidebar-menu {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 240px;
  border-right: none;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  color: white;
  font-size: 18px;
  font-weight: bold;
}

:deep(.el-menu-item) {
  border-left: 3px solid transparent;
}

:deep(.el-menu-item.is-active) {
  border-left: 3px solid var(--el-color-primary);
  background-color: var(--el-color-primary-light-9) !important;
}
</style> 