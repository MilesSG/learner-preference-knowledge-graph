<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useLearningStore } from '../stores/learning';
import { usePreferenceStore } from '../stores/preference';
import type { KnowledgeNode, ResourceRecommendation, LearningPath } from '../types/learning';
import { 
  VideoPlay, 
  Reading, 
  Document, 
  QuestionFilled,
  Connection,
  Timer,
  Medal,
  More,
  Right,
  Promotion,
  Refresh,
  Collection,
  Platform
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const learningStore = useLearningStore();
const preferenceStore = usePreferenceStore();

const loading = ref(false);
const activeNode = ref<KnowledgeNode | null>(null);
const selectedResources = ref<ResourceRecommendation[]>([]);

// 添加路径定义的接口
interface DefaultPath {
  id: string;
  title: string;
  icon: any; // 图标组件
  description: string;
  subjects: string[];
  coverImage: string;
  difficulty: number;
  duration: string;
  steps: string[];
}

// 添加默认学习路径方向
const defaultPathDirections = [
  {
    id: 'frontend',
    title: '前端开发学习路径',
    icon: Platform,
    description: '学习现代Web前端开发技术，包括HTML、CSS、JavaScript、Vue.js等',
    subjects: ['计算机科学', '前端开发', 'Web技术'],
    coverImage: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=1000',
    difficulty: 3,
    duration: '3-6个月',
    steps: [
      '网页基础 - HTML与CSS',
      'JavaScript编程基础',
      'Vue.js框架入门',
      '前端工程化与自动化',
      '实战项目开发'
    ]
  },
  {
    id: 'ai',
    title: '人工智能入门路径',
    icon: Connection,
    description: '从数学基础到机器学习、深度学习算法与应用，系统学习人工智能',
    subjects: ['人工智能', '数据科学', '机器学习'],
    coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000',
    difficulty: 4,
    duration: '6-12个月',
    steps: [
      '数学基础 - 线性代数与概率统计',
      'Python编程与数据处理',
      '机器学习算法基础',
      '深度学习入门',
      'AI项目实战'
    ]
  },
  {
    id: 'data',
    title: '数据分析师成长路径',
    icon: More,
    description: '掌握数据处理、分析与可视化能力，成为数据分析专家',
    subjects: ['数据分析', '统计学', '数据可视化'],
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000',
    difficulty: 3,
    duration: '4-8个月',
    steps: [
      '数据分析基础与方法论',
      '数据处理与清洗技术',
      '统计分析与模型构建',
      '数据可视化技巧',
      '业务数据分析实战'
    ]
  },
  {
    id: 'backend',
    title: '后端开发进阶路径',
    icon: Collection,
    description: '系统学习服务器端编程、数据库设计与分布式系统架构',
    subjects: ['后端开发', '数据库', '系统架构'],
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000',
    difficulty: 4,
    duration: '6-12个月',
    steps: [
      '编程语言进阶 (Java/Python/Go)',
      '数据库设计与优化',
      'API设计与RESTful服务',
      '微服务架构',
      '高并发与分布式系统'
    ]
  }
];

// 当前选择的默认路径
const selectedDefaultPath = ref<DefaultPath>(defaultPathDirections[0]);

// 是否显示默认路径
const showDefaultPaths = ref(true);

const resourceTypeIcons: Record<string, any> = {
  video: VideoPlay,
  article: Document,
  quiz: QuestionFilled,
  exercise: Reading,
  project: Connection,
  interactive: Connection,
  ebook: Reading,
  course: Document
};

// 切换到自定义学习路径
function switchToCustomPath() {
  showDefaultPaths.value = false;
  generatePath();
}

// 选择默认学习路径
function selectDefaultPath(path: DefaultPath) {
  selectedDefaultPath.value = path;
}

// 基于默认路径生成个性化学习路径
function generateFromDefault(path: DefaultPath) {
  showDefaultPaths.value = false;
  loading.value = true;
  
  // 模拟生成过程
  setTimeout(async () => {
    // 使用默认路径的subjects生成学习路径
    await learningStore.generateLearningPath(path.subjects);
    if (learningStore.currentPath?.nodes.length) {
      activeNode.value = learningStore.currentPath.nodes[0];
      updateSelectedResources();
    }
    loading.value = false;
  }, 1000);
}

// 生成学习路径
async function generatePath() {
  loading.value = true;
  try {
    const preference = preferenceStore.currentPreference;
    if (!preference) {
      ElMessage.warning('请先设置学习偏好');
      return;
    }

    // 从偏好设置中获取选择的学科
    const subjects = preference.answers?.['sp-1'] as string[] || [];
    if (subjects.length === 0) {
      ElMessage.warning('请先在偏好设置中选择感兴趣的学科');
      return;
    }

    await learningStore.generateLearningPath(subjects);
    if (learningStore.currentPath?.nodes.length) {
      activeNode.value = learningStore.currentPath.nodes[0];
      updateSelectedResources();
    }
  } catch (error) {
    console.error('生成学习路径失败:', error);
    ElMessage.error('生成学习路径失败，请重试');
  } finally {
    loading.value = false;
  }
}

// 更新选中节点的推荐资源
function updateSelectedResources() {
  if (activeNode.value) {
    selectedResources.value = learningStore.getResourceRecommendations(activeNode.value);
  }
}

// 处理节点点击
function handleNodeClick(node: KnowledgeNode) {
  activeNode.value = node;
  updateSelectedResources();
}

// 计算当前路径进度
const pathProgress = computed(() => {
  if (!learningStore.currentPath) return 0;
  return learningStore.currentPath.progress;
});

// 获取当前学习路径标题
const currentPathTitle = computed(() => {
  if (showDefaultPaths.value) {
    return selectedDefaultPath.value.title;
  } else if (learningStore.currentPath) {
    return '个性化学习路径';
  }
  return '';
});

// 获取资源类型名称的函数
function getResourceTypeName(type: string): string {
  const typeNames = {
    video: '视频课程',
    article: '文章教程',
    quiz: '测试题',
    exercise: '练习',
    project: '项目实战',
    interactive: '交互式学习',
    ebook: '电子书',
    course: '系统课程'
  };
  return typeNames[type as keyof typeof typeNames] || type;
}

// 获取默认背景的函数
function getDefaultBackground(pathId: string): string {
  // 根据路径ID返回不同的渐变色背景
  const gradients = {
    'frontend': 'linear-gradient(135deg, #42b883 0%, #35495e 100%)',
    'ai': 'linear-gradient(135deg, #3498db 0%, #8e44ad 100%)',
    'data': 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
    'backend': 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)'
  };
  
  return gradients[pathId as keyof typeof gradients] || 'linear-gradient(135deg, #4b79a1 0%, #283e51 100%)';
}

onMounted(async () => {
  // 默认显示预定义路径，不自动生成
  // 如果有偏好设置，则可以点击生成个性化路径
});
</script>

<template>
  <div class="learning-path">
    <div class="header-section mb-8">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">个性化学习路径</h1>
          <p class="text-gray-600 mt-2">
            基于您的学习偏好，为您定制的学习计划
          </p>
        </div>
        <el-button type="primary" @click="showDefaultPaths ? switchToCustomPath() : generatePath()" :loading="loading">
          <el-icon class="mr-1"><Refresh /></el-icon>
          {{ showDefaultPaths ? '生成个性化路径' : '重新生成路径' }}
        </el-button>
      </div>
    </div>

    <!-- 默认学习路径选择 - 新闻卡片风格 -->
    <div v-if="showDefaultPaths" class="default-paths-container mb-8">
      <h2 class="text-xl font-medium mb-4">选择学习方向</h2>
      <div class="ax-grid">
        <div 
          v-for="path in defaultPathDirections" 
          :key="path.id"
          class="ax-card"
          :class="{ 'active': selectedDefaultPath.id === path.id }"
          @click="selectDefaultPath(path)"
        >
          <!-- 卡片头部/图片区域 -->
          <div class="ax-card-header">
            <div 
              class="poster" 
              :style="{ 
                backgroundImage: path.coverImage ? 
                  `url(${path.coverImage})` : 
                  getDefaultBackground(path.id)
              }"
            >
              <div class="poster-overlay">
                <span class="path-difficulty">
                  <el-icon><Medal /></el-icon>
                  难度 {{ path.difficulty }}/5
                </span>
                <span class="path-duration">
                  <el-icon><Timer /></el-icon>
                  {{ path.duration }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- 卡片内容区域 -->
          <div class="ax-card-body">
            <div class="caption">
              <h3>{{ path.title }}</h3>
              <p class="description">{{ path.description }}</p>
            </div>
            
            <div class="path-steps-container">
              <h4 class="steps-title">学习步骤</h4>
              <ol class="path-steps">
                <li v-for="(step, index) in path.steps" :key="index" class="path-step-item">
                  <span class="step-number">{{ index + 1 }}</span>
                  <span class="step-text">{{ step }}</span>
                </li>
              </ol>
            </div>
            
            <div class="byline-keywords">
              <div class="keywords">
                <span 
                  v-for="subject in path.subjects.slice(0, 3)" 
                  :key="subject"
                  class="keyword"
                >{{ subject }}</span>
              </div>
            </div>
          </div>
          
          <!-- 卡片底部/操作区域 -->
          <div class="ax-card-footer">
            <span class="views-count">
              <el-icon><Connection /></el-icon> 学习路径
            </span>
            
            <div class="actions">
              <el-button 
                type="primary" 
                @click.stop="generateFromDefault(path)"
                :loading="loading"
                class="customize-btn"
              >
                个性化此路径
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!preferenceStore.currentPreference && !showDefaultPaths" class="empty-state">
      <el-empty description="请先完成学习偏好设置">
        <el-button type="primary" @click="$router.push('/preference-settings')">
          去设置
        </el-button>
      </el-empty>
    </div>

    <div v-else-if="!learningStore.currentPath && !loading && !showDefaultPaths" class="empty-state">
      <el-empty description="暂无学习路径">
        <el-button type="primary" @click="generatePath">
          生成学习路径
        </el-button>
      </el-empty>
    </div>

    <!-- 自定义学习路径显示 -->
    <div v-else-if="learningStore.currentPath && !showDefaultPaths" class="custom-path-container">
      <div class="grid grid-cols-12 gap-8">
        <!-- 左侧知识路径 -->
        <div class="col-span-4">
          <el-card class="path-card">
            <template #header>
              <div class="flex justify-between items-center">
                <h2 class="text-lg font-medium">学习进度</h2>
                <el-progress
                  type="circle"
                  :percentage="pathProgress"
                  :width="40"
                />
              </div>
            </template>

            <div class="path-nodes">
              <div 
                v-for="(node, index) in learningStore.currentPath.nodes" 
                :key="node.id"
                class="path-node"
                :class="{'active-node': node === activeNode}"
                @click="handleNodeClick(node)"
              >
                <div class="node-number">{{ index + 1 }}</div>
                <div class="node-content">
                  <h3 class="node-title">{{ node.title }}</h3>
                  <p class="node-description">{{ node.description }}</p>
                  <div class="node-meta">
                    <span class="node-time">
                      <el-icon><Timer /></el-icon> {{ node.estimatedDuration }}分钟
                    </span>
                    <span class="node-difficulty">
                      <el-icon><Medal /></el-icon> 难度:{{ node.difficulty }}/5
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 右侧学习资源 -->
        <div class="col-span-8">
          <el-card v-if="activeNode" class="resource-card">
            <template #header>
              <div class="flex justify-between items-center">
                <div>
                  <h2 class="text-lg font-medium">{{ activeNode.title }}</h2>
                  <p class="text-sm text-gray-500 mt-1">
                    预计学习时间: {{ activeNode.estimatedDuration }} 分钟
                  </p>
                </div>
                <el-tag :type="activeNode.difficulty <= 2 ? 'success' : 'warning'">
                  难度: {{ activeNode.difficulty }}/5
                </el-tag>
              </div>
            </template>

            <div class="resources-grid">
              <div 
                v-for="rec in selectedResources" 
                :key="rec.resource.id" 
                class="resource-item"
              >
                <div class="resource-card-inner">
                  <div class="resource-header">
                    <el-icon :size="28" class="resource-icon">
                      <component :is="resourceTypeIcons[rec.resource.type]" />
                    </el-icon>
                    <div class="resource-type">{{ getResourceTypeName(rec.resource.type) }}</div>
                  </div>
                  
                  <div class="resource-content">
                    <h3 class="resource-title">{{ rec.resource.title }}</h3>
                    <p class="resource-description">{{ rec.resource.description }}</p>
                    
                    <div class="resource-tags">
                      <el-tag 
                        v-for="reason in rec.reasons.slice(0, 2)" 
                        :key="reason"
                        class="reason-tag"
                        type="success"
                        size="small"
                      >
                        {{ reason }}
                      </el-tag>
                      <span v-if="rec.reasons.length > 2" class="more-tag">+{{ rec.reasons.length - 2 }}</span>
                    </div>
                  </div>
                  
                  <div class="resource-footer">
                    <div class="resource-meta">
                      <span class="resource-duration">
                        <el-icon><Timer /></el-icon> {{ rec.resource.duration }}分钟
                      </span>
                      <span class="resource-match">
                        匹配度: {{ Math.round(rec.matchScore) }}%
                      </span>
                    </div>
                    <el-button type="primary" class="start-btn">
                      开始学习
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </el-card>

          <div v-else class="text-center py-8">
            <el-empty description="请选择一个知识点开始学习" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.learning-path {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* 新闻卡片网格布局 */
.ax-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .ax-grid {
    grid-template-columns: 1fr;
  }
}

/* 卡片样式 */
.ax-card {
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
  cursor: pointer;
}

.ax-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  transform: translateY(-4px);
}

.ax-card.active {
  border: 2px solid #409EFF;
}

/* 卡片头部和海报 */
.ax-card-header {
  position: relative;
}

.poster {
  height: 180px;
  background-position: center;
  background-size: cover;
  position: relative;
}

.poster-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.path-difficulty, .path-duration {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 500;
}

.path-difficulty .el-icon, .path-duration .el-icon {
  margin-right: 4px;
}

/* 卡片内容 */
.ax-card-body {
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.caption {
  margin-bottom: 0.75rem;
}

.caption h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #303133;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
}

.description {
  font-size: 0.875rem;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.path-steps-container {
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  flex-grow: 1;
}

.steps-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #606266;
  margin-bottom: 0.5rem;
}

.path-steps {
  list-style: none;
  padding: 0;
  margin: 0;
}

.path-step-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.875rem;
  color: #606266;
}

.step-number {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #f0f2f5;
  color: #909399;
  margin-right: 8px;
  font-size: 12px;
  font-weight: bold;
}

.step-text {
  line-height: 1.4;
}

.byline-keywords {
  margin-top: auto;
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.keyword {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background-color: #f0f2f5;
  color: #606266;
  border-radius: 4px;
  font-size: 0.75rem;
}

/* 卡片底部 */
.ax-card-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid #f0f2f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #909399;
}

.views-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.actions {
  display: flex;
  align-items: center;
}

.customize-btn {
  font-size: 0.875rem;
}

/* 学习路径节点样式 */
.path-card {
  position: sticky;
  top: 2rem;
}

.path-nodes {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.path-node {
  display: flex;
  padding: 1rem;
  border-radius: 8px;
  background-color: #f5f7fa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.path-node:hover {
  background-color: #ecf5ff;
  transform: translateY(-2px);
}

.path-node.active-node {
  background-color: #ecf5ff;
  border-left: 4px solid #409EFF;
}

.node-number {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #409EFF;
  color: white;
  font-weight: bold;
  margin-right: 1rem;
}

.node-content {
  flex-grow: 1;
}

.node-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #303133;
}

.node-description {
  font-size: 0.875rem;
  color: #606266;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.node-meta {
  display: flex;
  font-size: 0.75rem;
  color: #909399;
  gap: 1rem;
}

.node-time, .node-difficulty {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 资源卡片样式 */
.resource-card {
  min-height: 600px;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
}

.resource-item {
  transition: all 0.3s ease;
}

.resource-card-inner {
  background-color: white;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.resource-card-inner:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.resource-header {
  padding: 0.75rem 1rem;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.resource-icon {
  color: #409EFF;
}

.resource-type {
  font-size: 0.875rem;
  font-weight: 600;
  color: #606266;
}

.resource-content {
  padding: 1rem;
}

.resource-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #303133;
  margin-bottom: 0.5rem;
}

.resource-description {
  font-size: 0.875rem;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.resource-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.reason-tag {
  font-size: 0.75rem;
}

.more-tag {
  font-size: 0.75rem;
  color: #909399;
  padding: 0.25rem 0.5rem;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.resource-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid #f0f2f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.resource-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.75rem;
  color: #909399;
}

.resource-duration, .resource-match {
  display: flex;
  align-items: center;
  gap: 4px;
}

.start-btn {
  font-size: 0.875rem;
}

.empty-state {
  background: white;
  border-radius: 8px;
  padding: 4rem;
  text-align: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style> 