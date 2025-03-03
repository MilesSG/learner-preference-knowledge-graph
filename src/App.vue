<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { 
  House, 
  Setting,
  List
} from '@element-plus/icons-vue';
import Sidebar from './components/layout/Sidebar.vue'

const router = useRouter();
const activeMenu = ref('');

const navigateTo = (path: string) => {
  router.push(path);
};
</script>

<template>
  <div class="app-container">
    <Sidebar class="sidebar" />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>
:root {
  --sidebar-width: 240px;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  height: 100%;
}

.app-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--sidebar-width);
  z-index: 1000;
}

.main-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2,
.card-header h3 {
  margin: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.app {
  @apply min-h-screen bg-gray-100;
}

.main-content {
  @apply ml-64 p-6;
}
</style> 