<template>
  <div class="profile">
    <el-container>
      <el-main>
        <el-row :gutter="20">
          <el-col :span="16">
            <el-card class="profile-card">
              <template #header>
                <div class="card-header">
                  <h2>个人信息</h2>
                  <el-button type="primary" @click="saveProfile">保存更改</el-button>
                </div>
              </template>
              
              <el-form :model="userProfile" label-width="100px">
                <el-form-item label="姓名">
                  <el-input v-model="userProfile.name" />
                </el-form-item>
                <el-form-item label="年龄">
                  <el-input-number v-model="userProfile.age" :min="16" :max="100" />
                </el-form-item>
                <el-form-item label="专业">
                  <el-input v-model="userProfile.major" />
                </el-form-item>
                <el-form-item label="年级">
                  <el-select v-model="userProfile.grade">
                    <el-option label="大一" value="freshman" />
                    <el-option label="大二" value="sophomore" />
                    <el-option label="大三" value="junior" />
                    <el-option label="大四" value="senior" />
                    <el-option label="研究生" value="graduate" />
                  </el-select>
                </el-form-item>
              </el-form>
            </el-card>
            
            <el-card class="learning-preferences">
              <template #header>
                <div class="card-header">
                  <h2>学习偏好设置</h2>
                </div>
              </template>
              
              <el-form :model="userProfile" label-width="100px">
                <el-form-item label="学习风格">
                  <el-checkbox-group v-model="userProfile.learningStyle">
                    <el-checkbox label="visual">视觉学习</el-checkbox>
                    <el-checkbox label="auditory">听觉学习</el-checkbox>
                    <el-checkbox label="reading">阅读学习</el-checkbox>
                    <el-checkbox label="kinesthetic">动手实践</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
                
                <el-form-item label="感兴趣领域">
                  <el-select
                    v-model="userProfile.preferences.subjects"
                    multiple
                    placeholder="选择感兴趣的学习领域"
                  >
                    <el-option
                      v-for="subject in subjects"
                      :key="subject.id"
                      :label="subject.name"
                      :value="subject.id"
                    />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="学习方式">
                  <el-select
                    v-model="userProfile.preferences.methods"
                    multiple
                    placeholder="选择偏好的学习方式"
                  >
                    <el-option
                      v-for="method in learningMethods"
                      :key="method.id"
                      :label="method.name"
                      :value="method.id"
                    />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="资源类型">
                  <el-select
                    v-model="userProfile.preferences.resources"
                    multiple
                    placeholder="选择偏好的资源类型"
                  >
                    <el-option
                      v-for="type in resourceTypes"
                      :key="type.id"
                      :label="type.name"
                      :value="type.id"
                    />
                  </el-select>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
          
          <el-col :span="8">
            <el-card class="learning-progress">
              <template #header>
                <div class="card-header">
                  <h2>学习进度</h2>
                </div>
              </template>
              
              <div class="progress-list">
                <div v-for="(progress, subject) in userProfile.progress" :key="subject" class="progress-item">
                  <h4>{{ getSubjectName(subject) }}</h4>
                  <el-progress
                    :percentage="progress"
                    :status="progress === 100 ? 'success' : ''"
                    :stroke-width="15"
                  />
                </div>
              </div>
            </el-card>
            
            <el-card class="recommendations">
              <template #header>
                <div class="card-header">
                  <h2>个性化推荐</h2>
                </div>
              </template>
              
              <el-timeline>
                <el-timeline-item
                  v-for="recommendation in recommendations"
                  :key="recommendation.id"
                  :timestamp="recommendation.type"
                  placement="top"
                >
                  <el-card>
                    <h4>{{ recommendation.title }}</h4>
                    <p>{{ recommendation.description }}</p>
                    <el-button type="primary" link>开始学习</el-button>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../stores/user'
import preferencesData from '../assets/data/learning-preferences.json'

const userStore = useUserStore()
const { subjects, learningMethods, resourceTypes } = preferencesData

const userProfile = ref({
  name: '张三',
  age: 20,
  major: '计算机科学',
  grade: 'sophomore',
  learningStyle: ['visual', 'kinesthetic'],
  preferences: {
    subjects: ['computer_science', 'web_development'],
    methods: ['self_paced', 'project_based'],
    resources: ['video', 'project']
  },
  progress: {
    'programming_basics': 100,
    'web_development': 60,
    'data_structures': 40,
    'algorithms': 20
  }
})

const recommendations = ref([
  {
    id: 1,
    type: '课程推荐',
    title: 'Web前端开发实战',
    description: '基于你的学习进度和偏好，推荐学习现代前端开发技术栈。'
  },
  {
    id: 2,
    type: '项目练习',
    title: '数据结构可视化项目',
    description: '动手实现一个数据结构可视化工具，巩固所学知识。'
  },
  {
    id: 3,
    type: '学习资源',
    title: '算法动画教程',
    description: '通过动画演示理解常用算法的工作原理。'
  }
])

const getSubjectName = (id: string) => {
  const subject = subjects.find(s => s.id === id)
  return subject ? subject.name : id
}

const saveProfile = () => {
  userStore.setProfile(userProfile.value)
  // 这里可以添加保存成功的提示
}
</script>

<style scoped>
.profile {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-card {
  margin-bottom: 20px;
}

.learning-preferences {
  margin-bottom: 20px;
}

.learning-progress {
  margin-bottom: 20px;
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.progress-item h4 {
  margin-bottom: 10px;
  color: #606266;
}

.recommendations :deep(.el-timeline-item__node) {
  background-color: #409EFF;
}

.recommendations :deep(.el-card) {
  margin-bottom: 10px;
}

.recommendations h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.recommendations p {
  margin: 0 0 10px 0;
  color: #606266;
}
</style> 