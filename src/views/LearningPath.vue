<template>
  <div class="learning-path">
    <el-container>
      <el-main>
        <el-row :gutter="20">
          <el-col :span="18">
            <el-card class="path-card">
              <template #header>
                <div class="card-header">
                  <h2>推荐学习路径</h2>
                  <el-radio-group v-model="currentPath" class="path-selector">
                    <el-radio-button label="frontend">前端开发</el-radio-button>
                    <el-radio-button label="backend">后端开发</el-radio-button>
                    <el-radio-button label="fullstack">全栈开发</el-radio-button>
                    <el-radio-button label="data">数据科学</el-radio-button>
                  </el-radio-group>
                </div>
              </template>
              
              <div class="path-timeline">
                <el-steps direction="vertical" :active="activeStep">
                  <el-step
                    v-for="(step, index) in currentPathSteps"
                    :key="index"
                    :title="step.title"
                    :description="step.description"
                  >
                    <template #icon>
                      <el-icon :class="{ 'is-active': index <= activeStep }">
                        <component :is="step.icon" />
                      </el-icon>
                    </template>
                    
                    <template #description>
                      <div class="step-content">
                        <p>{{ step.description }}</p>
                        <div class="step-resources">
                          <el-collapse v-if="step.resources.length">
                            <el-collapse-item title="推荐学习资源">
                              <el-table :data="step.resources" style="width: 100%">
                                <el-table-column prop="title" label="资源名称" />
                                <el-table-column prop="type" label="类型" width="120">
                                  <template #default="{ row }">
                                    <el-tag :type="getResourceTagType(row.type)">
                                      {{ row.type }}
                                    </el-tag>
                                  </template>
                                </el-table-column>
                                <el-table-column prop="duration" label="时长" width="120" />
                                <el-table-column fixed="right" label="操作" width="120">
                                  <template #default="{ row }">
                                    <el-button type="primary" link @click="startLearning(row)">
                                      开始学习
                                    </el-button>
                                  </template>
                                </el-table-column>
                              </el-table>
                            </el-collapse-item>
                          </el-collapse>
                        </div>
                        
                        <div class="step-progress" v-if="step.progress !== undefined">
                          <el-progress
                            :percentage="step.progress"
                            :status="step.progress === 100 ? 'success' : ''"
                          />
                        </div>
                      </div>
                    </template>
                  </el-step>
                </el-steps>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="6">
            <el-card class="path-info">
              <template #header>
                <div class="card-header">
                  <h3>路径信息</h3>
                </div>
              </template>
              
              <div class="info-content">
                <div class="info-item">
                  <h4>预计完成时间</h4>
                  <p>{{ currentPathInfo.duration }}</p>
                </div>
                
                <div class="info-item">
                  <h4>难度等级</h4>
                  <el-rate
                    v-model="currentPathInfo.difficulty"
                    :max="5"
                    disabled
                    show-score
                    text-color="#ff9900"
                  />
                </div>
                
                <div class="info-item">
                  <h4>技能获得</h4>
                  <div class="skills-list">
                    <el-tag
                      v-for="skill in currentPathInfo.skills"
                      :key="skill"
                      class="skill-tag"
                    >
                      {{ skill }}
                    </el-tag>
                  </div>
                </div>
                
                <div class="info-item">
                  <h4>总体进度</h4>
                  <el-progress
                    :percentage="currentPathInfo.totalProgress"
                    type="circle"
                    :width="120"
                  />
                </div>
              </div>
            </el-card>
            
            <el-card class="achievements">
              <template #header>
                <div class="card-header">
                  <h3>学习成就</h3>
                </div>
              </template>
              
              <div class="achievements-list">
                <div
                  v-for="achievement in currentPathInfo.achievements"
                  :key="achievement.id"
                  class="achievement-item"
                >
                  <el-tooltip
                    :content="achievement.description"
                    placement="top"
                    effect="light"
                  >
                    <el-avatar
                      :size="60"
                      :class="{ 'is-locked': !achievement.unlocked }"
                      :src="achievement.icon"
                    />
                  </el-tooltip>
                  <span class="achievement-name">{{ achievement.name }}</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Document,
  Notebook,
  Reading,
  Connection,
  Monitor,
  DataLine,
  Cpu
} from '@element-plus/icons-vue'

const currentPath = ref('frontend')
const activeStep = ref(2)

const pathsData = {
  frontend: {
    duration: '4-6 个月',
    difficulty: 3.5,
    skills: ['HTML/CSS', 'JavaScript', 'Vue.js', 'React', 'Web性能优化'],
    totalProgress: 45,
    achievements: [
      {
        id: 1,
        name: '前端新手',
        description: '完成第一个前端项目',
        icon: 'path/to/icon1.png',
        unlocked: true
      },
      {
        id: 2,
        name: '组件大师',
        description: '创建10个可复用组件',
        icon: 'path/to/icon2.png',
        unlocked: false
      }
    ],
    steps: [
      {
        title: 'Web基础',
        description: '学习HTML、CSS和JavaScript基础知识',
        icon: Document,
        progress: 100,
        resources: [
          {
            title: 'Web开发入门教程',
            type: '视频课程',
            duration: '20小时'
          }
        ]
      },
      {
        title: 'JavaScript进阶',
        description: '深入学习JavaScript高级特性和ES6+',
        icon: Notebook,
        progress: 80,
        resources: [
          {
            title: 'JavaScript高级程序设计',
            type: '电子书',
            duration: '30小时'
          }
        ]
      },
      {
        title: 'Vue.js基础',
        description: '学习Vue.js框架基础知识和核心概念',
        icon: Monitor,
        progress: 40,
        resources: [
          {
            title: 'Vue.js官方教程',
            type: '在线文档',
            duration: '15小时'
          }
        ]
      }
    ]
  }
}

const currentPathInfo = computed(() => pathsData[currentPath.value])
const currentPathSteps = computed(() => currentPathInfo.value.steps)

const getResourceTagType = (type: string) => {
  const types = {
    '视频课程': 'primary',
    '电子书': 'success',
    '在线文档': 'info',
    '实践项目': 'warning'
  }
  return types[type] || 'info'
}

const startLearning = (resource: any) => {
  // 实现开始学习的逻辑
  console.log('开始学习:', resource.title)
}
</script>

<style scoped>
.learning-path {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.path-selector {
  margin-left: 20px;
}

.path-timeline {
  padding: 20px 0;
}

.step-content {
  padding: 10px 0;
}

.step-resources {
  margin: 10px 0;
}

.step-progress {
  margin-top: 15px;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-item {
  text-align: center;
}

.info-item h4 {
  margin-bottom: 10px;
  color: #606266;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.achievements {
  margin-top: 20px;
}

.achievements-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  padding: 10px;
}

.achievement-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.achievement-name {
  font-size: 12px;
  color: #606266;
  text-align: center;
}

.is-locked {
  filter: grayscale(1);
  opacity: 0.6;
}

:deep(.el-step__icon.is-active) {
  color: #409EFF;
}

:deep(.el-step__title.is-active) {
  color: #409EFF;
}
</style> 