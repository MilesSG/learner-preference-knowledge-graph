<template>
  <div class="resources-page">
    <!-- 筛选区域 -->
    <div class="filters-section mb-8">
      <el-card class="filter-card">
        <template #header>
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-medium">资源筛选</h2>
            <el-button type="primary" link @click="resetFilters">
              重置筛选
            </el-button>
          </div>
        </template>

        <div class="filter-grid">
          <!-- 搜索框 -->
          <div class="filter-item">
            <label class="filter-label">关键词搜索</label>
            <el-input
              v-model="searchQuery"
              placeholder="搜索学习资源..."
              :prefix-icon="Search"
              clearable
              class="filter-input"
            />
          </div>

          <!-- 资源类型 -->
          <div class="filter-item">
            <label class="filter-label">资源类型</label>
            <el-select
              v-model="selectedType"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="选择资源类型"
              clearable
              class="filter-input"
            >
              <el-option
                v-for="(label, type) in resourceTypes"
                :key="type"
                :label="label"
                :value="type"
              />
            </el-select>
          </div>

          <!-- 难度等级 -->
          <div class="filter-item">
            <label class="filter-label">难度等级</label>
            <el-select
              v-model="selectedDifficulty"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="选择难度等级"
              clearable
              class="filter-input"
            >
              <el-option
                v-for="level in difficultyLevels"
                :key="level.value"
                :label="level.label"
                :value="level.value"
              />
            </el-select>
          </div>

          <!-- 学科 -->
          <div class="filter-item">
            <label class="filter-label">学科领域</label>
            <el-select
              v-model="selectedSubject"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="选择学科"
              clearable
              class="filter-input"
            >
              <el-option
                v-for="subject in subjects"
                :key="subject"
                :label="subject"
                :value="subject"
              />
            </el-select>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 资源列表 -->
    <div class="resources-grid">
      <div
        v-for="resource in filteredResources"
        :key="resource.id"
        class="resource-wrapper"
      >
        <el-card
          class="resource-card"
          :body-style="{ padding: '0px' }"
          shadow="hover"
        >
          <div class="resource-image">
            <img 
              :src="resource.coverImage" 
              :alt="resource.title"
              @error="handleImageError"
            >
            <div class="resource-overlay">
              <div class="resource-type">
                {{ resourceTypes[resource.type] }}
              </div>
              <div class="resource-duration">
                <el-icon><Timer /></el-icon>
                {{ resource.duration }}分钟
              </div>
            </div>
          </div>

          <div class="resource-content">
            <div class="resource-header">
              <h3 class="resource-title">{{ resource.title }}</h3>
              <p class="resource-description">{{ resource.description }}</p>
            </div>

            <div class="resource-info">
              <div class="resource-meta">
                <div class="meta-row">
                  <el-tag 
                    size="small" 
                    :type="resource.difficulty <= 2 ? 'success' : resource.difficulty <= 3 ? 'warning' : 'danger'"
                    class="difficulty-tag"
                  >
                    {{ difficultyLevels[resource.difficulty - 1].label }}
                  </el-tag>
                  <span class="author">{{ resource.author || '匿名作者' }}</span>
                </div>

                <div class="tags-container">
                  <el-tag
                    v-for="tag in resource.tags"
                    :key="tag"
                    size="small"
                    effect="plain"
                    class="resource-tag"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>

              <div class="resource-actions">
                <el-button 
                  type="primary" 
                  class="start-button"
                  @click="startLearning(resource)"
                >
                  开始学习
                  <el-icon class="el-icon--right"><ArrowRight /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 无数据提示 -->
    <el-empty
      v-if="filteredResources.length === 0"
      description="暂无符合条件的学习资源"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLearningStore } from '../stores/learning'
import type { LearningResource, ResourceType } from '../types/learning'
import { Search, Timer, ArrowRight } from '@element-plus/icons-vue'

const learningStore = useLearningStore()

// 筛选条件
const searchQuery = ref('')
const selectedType = ref<ResourceType[]>([])
const selectedDifficulty = ref<number[]>([])
const selectedSubject = ref<string[]>([])

// 资源类型选项
const resourceTypes = {
  video: '视频课程',
  article: '文章教程',
  quiz: '测试题',
  exercise: '练习',
  project: '项目实战',
  interactive: '交互式学习',
  ebook: '电子书',
  course: '系统课程'
} as const

// 难度等级选项
const difficultyLevels = [
  { value: 1, label: '入门' },
  { value: 2, label: '基础' },
  { value: 3, label: '进阶' },
  { value: 4, label: '高级' },
  { value: 5, label: '专家' }
]

// 获取所有可用的学科
const subjects = computed(() => {
  const subjectSet = new Set<string>()
  learningStore.knowledgeGraph.forEach(node => {
    subjectSet.add(node.subject)
  })
  return Array.from(subjectSet)
})

// 获取所有资源
const allResources = computed(() => {
  return learningStore.knowledgeGraph.flatMap(node => 
    node.resources.map(resource => ({
      ...resource,
      nodeTitle: node.title,
      nodeId: node.id
    }))
  )
})

// 筛选后的资源
const filteredResources = computed(() => {
  return allResources.value.filter(resource => {
    // 搜索过滤
    if (searchQuery.value && !resource.title.toLowerCase().includes(searchQuery.value.toLowerCase())) {
      return false
    }
    // 类型过滤
    if (selectedType.value.length && !selectedType.value.includes(resource.type)) {
      return false
    }
    // 难度过滤
    if (selectedDifficulty.value.length && !selectedDifficulty.value.includes(resource.difficulty)) {
      return false
    }
    // 学科过滤
    if (selectedSubject.value.length && !selectedSubject.value.includes(resource.subject)) {
      return false
    }
    return true
  })
})

// 重置筛选条件
function resetFilters() {
  searchQuery.value = ''
  selectedType.value = []
  selectedDifficulty.value = []
  selectedSubject.value = []
}

// 默认封面图片
const defaultCoverImage = 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1000'

// 处理图片加载错误
function handleImageError(e: Event) {
  const imgElement = e.target as HTMLImageElement
  imgElement.src = defaultCoverImage
}

// 开始学习
function startLearning(resource: LearningResource) {
  window.open(resource.url, '_blank')
}
</script>

<style scoped>
.resources-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.filter-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 24px;
  padding: 16px;
}

@media (min-width: 640px) {
  .filter-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .filter-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-regular);
  margin-bottom: 4px;
}

.filter-input {
  width: 100%;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 32px;
  margin-top: 32px;
}

.resource-wrapper {
  display: flex;
  height: 100%;
}

.resource-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid var(--el-border-color-lighter);
}

.resource-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.resource-image {
  position: relative;
  height: 200px;
  overflow: hidden;
  background-color: var(--el-fill-color-lighter);
}

.resource-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.resource-card:hover .resource-image img {
  transform: scale(1.05);
}

.resource-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%);
}

.resource-type {
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  backdrop-filter: blur(4px);
  background: rgba(0, 0, 0, 0.6);
}

.resource-duration {
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
  background: rgba(0, 0, 0, 0.6);
}

.resource-content {
  display: flex;
  flex-direction: column;
  padding: 20px;
  flex-grow: 1;
  background-color: white;
}

.resource-header {
  margin-bottom: 16px;
}

.resource-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
  line-height: 1.4;
}

.resource-description {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.6;
}

.resource-info {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.resource-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.difficulty-tag {
  font-weight: 500;
}

.author {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.resource-tag {
  font-size: 12px;
}

.resource-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.start-button {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;
}

.start-button:hover {
  transform: translateX(4px);
}

:deep(.el-card__body) {
  padding: 0 !important;
  height: 100%;
}
</style> 