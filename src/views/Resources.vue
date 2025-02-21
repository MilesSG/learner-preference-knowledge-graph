<template>
  <div class="resources">
    <el-container>
      <el-aside width="280px">
        <el-card class="filter-card">
          <template #header>
            <div class="card-header">
              <h3>资源筛选</h3>
              <el-button text @click="resetFilters">重置</el-button>
            </div>
          </template>
          
          <el-form>
            <el-form-item label="资源类型">
              <el-select
                v-model="filters.types"
                multiple
                placeholder="选择资源类型"
                style="width: 100%"
              >
                <el-option
                  v-for="type in resourceTypes"
                  :key="type.id"
                  :label="type.name"
                  :value="type.id"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="难度等级">
              <el-select
                v-model="filters.difficulty"
                multiple
                placeholder="选择难度等级"
                style="width: 100%"
              >
                <el-option label="入门" value="beginner" />
                <el-option label="初级" value="elementary" />
                <el-option label="中级" value="intermediate" />
                <el-option label="高级" value="advanced" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="学习领域">
              <el-select
                v-model="filters.subjects"
                multiple
                placeholder="选择学习领域"
                style="width: 100%"
              >
                <el-option
                  v-for="subject in subjects"
                  :key="subject.id"
                  :label="subject.name"
                  :value="subject.id"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="排序方式">
              <el-radio-group v-model="filters.sort">
                <el-radio label="recommended">推荐优先</el-radio>
                <el-radio label="newest">最新发布</el-radio>
                <el-radio label="popular">最受欢迎</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-card>
      </el-aside>
      
      <el-main>
        <div class="resources-header">
          <div class="search-box">
            <el-input
              v-model="searchQuery"
              placeholder="搜索学习资源..."
              :prefix-icon="Search"
              clearable
            />
          </div>
          
          <div class="view-toggle">
            <el-radio-group v-model="viewMode" size="large">
              <el-radio-button label="grid">
                <el-icon><Grid /></el-icon>
              </el-radio-button>
              <el-radio-button label="list">
                <el-icon><List /></el-icon>
              </el-radio-button>
            </el-radio-group>
          </div>
        </div>
        
        <div class="resources-content" :class="viewMode">
          <template v-if="viewMode === 'grid'">
            <el-row :gutter="20">
              <el-col
                v-for="resource in filteredResources"
                :key="resource.id"
                :xs="24"
                :sm="12"
                :md="8"
                :lg="6"
              >
                <el-card class="resource-card" :body-style="{ padding: '0px' }">
                  <img :src="resource.cover" class="resource-image">
                  <div class="resource-info">
                    <h4>{{ resource.title }}</h4>
                    <p class="description">{{ resource.description }}</p>
                    <div class="meta">
                      <el-tag size="small" :type="getResourceTagType(resource.type)">
                        {{ resource.type }}
                      </el-tag>
                      <el-tag size="small" type="info">{{ resource.duration }}</el-tag>
                    </div>
                    <div class="actions">
                      <el-button type="primary" @click="startLearning(resource)">
                        开始学习
                      </el-button>
                      <el-button @click="addToFavorites(resource)">
                        <el-icon><Star /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </template>
          
          <template v-else>
            <el-table :data="filteredResources" style="width: 100%">
              <el-table-column prop="title" label="资源名称">
                <template #default="{ row }">
                  <div class="resource-title">
                    <img :src="row.cover" class="resource-thumbnail">
                    <div>
                      <h4>{{ row.title }}</h4>
                      <p class="description">{{ row.description }}</p>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="type" label="类型" width="120">
                <template #default="{ row }">
                  <el-tag :type="getResourceTagType(row.type)">
                    {{ row.type }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="duration" label="时长" width="100" />
              <el-table-column prop="difficulty" label="难度" width="100" />
              <el-table-column fixed="right" label="操作" width="150">
                <template #default="{ row }">
                  <el-button type="primary" link @click="startLearning(row)">
                    开始学习
                  </el-button>
                  <el-button link @click="addToFavorites(row)">
                    <el-icon><Star /></el-icon>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </div>
        
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="totalResources"
            :page-sizes="[12, 24, 36, 48]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Grid, List, Star } from '@element-plus/icons-vue'
import preferencesData from '../assets/data/learning-preferences.json'

const { subjects, resourceTypes } = preferencesData

// 模拟资源数据
const resources = [
  {
    id: 1,
    title: 'Vue.js 3.0 完全指南',
    description: '从入门到精通的Vue.js 3.0学习课程',
    type: '视频课程',
    duration: '25小时',
    difficulty: 'intermediate',
    cover: 'path/to/vue-course.jpg',
    subject: 'web_development'
  },
  {
    id: 2,
    title: '数据结构与算法实战',
    description: '通过实际案例学习数据结构与算法',
    type: '实践项目',
    duration: '40小时',
    difficulty: 'advanced',
    cover: 'path/to/algorithm.jpg',
    subject: 'computer_science'
  }
  // 更多资源...
]

const searchQuery = ref('')
const viewMode = ref('grid')
const currentPage = ref(1)
const pageSize = ref(12)
const totalResources = ref(100)

const filters = ref({
  types: [],
  difficulty: [],
  subjects: [],
  sort: 'recommended'
})

const filteredResources = computed(() => {
  let result = [...resources]
  
  // 应用搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(resource =>
      resource.title.toLowerCase().includes(query) ||
      resource.description.toLowerCase().includes(query)
    )
  }
  
  // 应用类型过滤
  if (filters.value.types.length) {
    result = result.filter(resource =>
      filters.value.types.includes(resource.type)
    )
  }
  
  // 应用难度过滤
  if (filters.value.difficulty.length) {
    result = result.filter(resource =>
      filters.value.difficulty.includes(resource.difficulty)
    )
  }
  
  // 应用领域过滤
  if (filters.value.subjects.length) {
    result = result.filter(resource =>
      filters.value.subjects.includes(resource.subject)
    )
  }
  
  // 应用排序
  switch (filters.value.sort) {
    case 'newest':
      result.sort((a, b) => b.id - a.id)
      break
    case 'popular':
      // 这里可以根据实际的受欢迎程度指标进行排序
      break
    default:
      // 推荐排序逻辑
      break
  }
  
  return result
})

const getResourceTagType = (type: string) => {
  const types = {
    '视频课程': 'primary',
    '电子书': 'success',
    '在线文档': 'info',
    '实践项目': 'warning'
  }
  return types[type] || 'info'
}

const resetFilters = () => {
  filters.value = {
    types: [],
    difficulty: [],
    subjects: [],
    sort: 'recommended'
  }
}

const startLearning = (resource: any) => {
  console.log('开始学习:', resource.title)
}

const addToFavorites = (resource: any) => {
  console.log('添加到收藏:', resource.title)
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  // 重新加载资源
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // 重新加载资源
}
</script>

<style scoped>
.resources {
  height: 100vh;
  background-color: #f5f7fa;
}

.filter-card {
  margin: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.resources-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  flex: 1;
  margin-right: 20px;
}

.resources-content {
  margin-bottom: 20px;
}

.resources-content.grid {
  margin: -10px;
}

.resource-card {
  margin-bottom: 20px;
  transition: transform 0.3s ease;
}

.resource-card:hover {
  transform: translateY(-5px);
}

.resource-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.resource-info {
  padding: 15px;
}

.resource-info h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #303133;
}

.description {
  margin: 10px 0;
  font-size: 14px;
  color: #606266;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  margin: 10px 0;
  display: flex;
  gap: 8px;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.resource-title {
  display: flex;
  align-items: center;
  gap: 15px;
}

.resource-thumbnail {
  width: 80px;
  height: 45px;
  object-fit: cover;
  border-radius: 4px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

:deep(.el-aside) {
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
}

:deep(.el-main) {
  padding: 20px;
}
</style> 