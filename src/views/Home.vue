<template>
  <div class="home">
    <el-container>
      <el-header height="60px">
        <div class="header-content">
          <h1>基于学习偏好的大学生个性化学习资源构建平台</h1>
          <div class="user-profile" @click="showUserMenu">
            <el-avatar :size="32" :src="userAvatar" />
            <span>{{ userName }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
        </div>
      </el-header>

      <el-main>
        <div class="knowledge-graph-container">
          <div class="graph-controls">
            <el-radio-group v-model="graphView" size="large">
              <el-radio-button label="preference">偏好视图</el-radio-button>
              <el-radio-button label="resource">资源视图</el-radio-button>
              <el-radio-button label="path">路径视图</el-radio-button>
            </el-radio-group>

            <div class="graph-filters">
              <el-select v-model="selectedStyles" multiple placeholder="学习风格" size="large">
                <el-option
                  v-for="style in learningStyles"
                  :key="style.value"
                  :label="style.label"
                  :value="style.value"
                />
              </el-select>

              <el-select v-model="selectedSubjects" multiple placeholder="学科" size="large">
                <el-option
                  v-for="subject in subjects"
                  :key="subject.value"
                  :label="subject.label"
                  :value="subject.value"
                />
              </el-select>
            </div>
          </div>

          <div class="graph-visualization" ref="graphContainer">
            <!-- Knowledge Graph will be rendered here -->
          </div>

          <div class="graph-info">
            <el-card v-if="selectedNode" class="node-info">
              <template #header>
                <div class="card-header">
                  <span>{{ selectedNode.name }}</span>
                  <el-tag size="small" :type="getCategoryType(selectedNode.category)">
                    {{ selectedNode.category }}
                  </el-tag>
                </div>
              </template>
              <p>{{ selectedNode.description }}</p>
              <div v-if="selectedNode.matchedStyles" class="matched-styles">
                <el-tag
                  v-for="style in selectedNode.matchedStyles"
                  :key="style"
                  size="small"
                  effect="plain"
                  class="style-tag"
                >
                  {{ style }}
                </el-tag>
              </div>
              <div class="node-resources" v-if="selectedNode.resources">
                <h4>相关资源</h4>
                <div v-for="resource in selectedNode.resources" :key="resource.id" class="resource-details">
                  <h5>{{ resource.title }}</h5>
                  <div class="resource-meta">
                    <span>难度: {{ resource.difficulty }}/5</span>
                    <span>时长: {{ resource.duration }}</span>
                  </div>
                  <el-button type="primary" size="small" @click="showResourceDetails(resource)">
                    查看详情
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>
        </div>

        <el-row :gutter="20" class="dashboard-section">
          <el-col :span="8">
            <el-card class="progress-card">
              <template #header>
                <div class="card-header">
                  <span>学习进度</span>
                </div>
              </template>
              <div v-for="(progress, subject) in learningProgress" :key="subject" class="progress-item">
                <span>{{ subject }}</span>
                <el-progress 
                  :percentage="progress" 
                  :color="getProgressColor(progress)"
                />
              </div>
            </el-card>
          </el-col>

          <el-col :span="8">
            <el-card class="recommendation-card">
              <template #header>
                <div class="card-header">
                  <span>个性化推荐</span>
                </div>
              </template>
              <el-timeline>
                <el-timeline-item
                  v-for="recommendation in recommendations"
                  :key="recommendation.id"
                  :type="recommendation.type === 'course' ? 'primary' : 'success'"
                >
                  <h4>{{ recommendation.title }}</h4>
                  <p>{{ recommendation.description }}</p>
                  <div class="resource-meta">
                    <span>难度: {{ recommendation.difficulty }}/5</span>
                    <span>时长: {{ recommendation.duration }}</span>
                  </div>
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="showResourceDetails(recommendation)"
                  >
                    开始学习
                  </el-button>
                </el-timeline-item>
              </el-timeline>
            </el-card>
          </el-col>

          <el-col :span="8">
            <el-card class="learning-path-card">
              <template #header>
                <div class="card-header">
                  <span>学习路径</span>
                </div>
              </template>
              <el-steps direction="vertical">
                <el-step
                  v-for="path in learningPath"
                  :key="path.id"
                  :title="path.title"
                  :description="path.description"
                  :status="path.status"
                >
                  <template #icon>
                    <el-icon v-if="path.status === 'success'"><Check /></el-icon>
                    <el-icon v-else-if="path.status === 'process'"><Loading /></el-icon>
                    <el-icon v-else><More /></el-icon>
                  </template>
                </el-step>
              </el-steps>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>

    <!-- User Preference Dialog -->
    <el-dialog
      v-model="showPreferenceDialog"
      title="学习偏好设置"
      width="50%"
    >
      <el-form :model="userPreferences" label-width="120px">
        <el-form-item label="学习风格">
          <el-checkbox-group v-model="userPreferences.learningStyles">
            <el-checkbox 
              v-for="style in learningStyles"
              :key="style.value"
              :label="style.value"
            >
              {{ style.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="目标学科">
          <el-select v-model="userPreferences.targetSubjects" multiple>
            <el-option
              v-for="subject in subjects"
              :key="subject.value"
              :label="subject.label"
              :value="subject.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="学习目标">
          <el-input
            v-model="userPreferences.learningGoals"
            type="textarea"
            rows="3"
            placeholder="请描述您的学习目标..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showPreferenceDialog = false">取消</el-button>
          <el-button type="primary" @click="savePreferences">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Progress Dialog -->
    <el-dialog
      v-model="showProgressDialog"
      title="学习进度详情"
      width="60%"
    >
      <el-tabs v-model="activeProgressTab">
        <el-tab-pane label="总体进度" name="overall">
          <div v-for="(progress, subject) in learningProgress" :key="subject" class="progress-item">
            <span>{{ subject }}</span>
            <el-progress 
              :percentage="progress" 
              :color="getProgressColor(progress)"
              :format="format => `${format}%`"
            />
          </div>
        </el-tab-pane>
        <el-tab-pane label="已完成" name="completed">
          <el-timeline>
            <el-timeline-item
              v-for="item in completedResources"
              :key="item.id"
              :timestamp="item.completedAt"
              type="success"
            >
              <h4>{{ item.title }}</h4>
              <p>{{ item.description }}</p>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
        <el-tab-pane label="进行中" name="ongoing">
          <el-timeline>
            <el-timeline-item
              v-for="item in ongoingResources"
              :key="item.id"
              :timestamp="item.startedAt"
              type="primary"
            >
              <h4>{{ item.title }}</h4>
              <p>{{ item.description }}</p>
              <el-progress :percentage="item.progress" />
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed, toRefs, watch } from 'vue'
import { useUserStore } from '../stores/user'
import * as d3 from 'd3'
import { ArrowDown } from '@element-plus/icons-vue'
import preferencesData from '../assets/data/learning-preferences.json'
import graphData from '../assets/data/knowledge-graph.json'
import {
  ViewType,
  ResourceType,
  CategoryType,
  GraphNode,
  GraphLink,
} from '../types/graph'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Selection, ZoomBehavior, DragBehavior } from 'd3'
import type { BaseType, SubjectPosition } from 'd3-selection'
import type { SimulationNodeDatum } from 'd3-force'

const userStore = useUserStore()
const graphContainer = ref<HTMLElement | null>(null)
const selectedNode = ref<GraphNode | null>(null)
const graphView = ref<ViewType>('preference')
const loginVisible = ref(false)
const preferenceVisible = ref(false)

const filters = reactive({
  learningStyle: [],
  subject: []
})

const loginForm = reactive({
  name: '',
  major: '',
  grade: ''
})

const preferences = reactive({
  learningStyles: [],
  subjects: [],
  methods: []
})

const { learningMethods } = preferencesData

// 模拟数据
const learningProgress = ref({
  '计算机基础': 85,
  '数据结构': 70,
  '算法设计': 60,
  'Web开发': 90,
  '数据科学': 40,
  '人工智能': 30
})

const recommendations = ref([
  {
    id: '1',
    title: '数据结构与算法基础',
    type: 'course',
    description: '系统学习常用数据结构和算法，包括数组、链表、树、图等',
    difficulty: 3,
    duration: '40小时',
    learningStyle: ['visual', 'reading'],
    url: '/courses/data-structures'
  },
  {
    id: '2',
    title: '个人博客项目实战',
    type: 'project',
    description: '使用Vue3和Element Plus构建现代化的个人博客系统',
    difficulty: 4,
    duration: '20小时',
    learningStyle: ['kinesthetic'],
    url: '/projects/blog'
  }
])

const learningPath = ref([
  {
    id: '1',
    title: '计算机基础知识',
    description: '已完成计算机组成原理和操作系统基础学习',
    status: 'success'
  },
  {
    id: '2',
    title: '数据结构与算法',
    description: '正在学习高级数据结构和算法设计',
    status: 'process'
  },
  {
    id: '3',
    title: 'Web全栈开发',
    description: '即将开始学习前后端开发技术',
    status: 'wait'
  }
])

const completedResources = ref([
  {
    id: '1',
    title: '计算机组成原理',
    description: '学习计算机硬件基础知识',
    completedAt: '2024-03-01'
  },
  {
    id: '2',
    title: '操作系统基础',
    description: '理解操作系统核心概念',
    completedAt: '2024-03-15'
  }
])

const ongoingResources = ref([
  {
    id: '1',
    title: '数据结构进阶',
    description: '学习高级数据结构',
    startedAt: '2024-03-20',
    progress: 60
  },
  {
    id: '2',
    title: '算法设计',
    description: '掌握常用算法设计方法',
    startedAt: '2024-03-25',
    progress: 30
  }
])

const dialogState = reactive({
  showProgressDialog: false,
  showPreferenceDialog: false,
  showLoginDialog: false,
});

const { userAvatar, userName, showPreferenceDialog, showProgressDialog, activeProgressTab, learningStyles, subjects, selectedStyles, selectedSubjects, userPreferences } = toRefs({
  ...dialogState,
  userAvatar: '/avatar.png',
  userName: '用户名',
  activeProgressTab: 'overall',
  learningStyles: [
    { value: 'visual', label: '视觉学习' },
    { value: 'auditory', label: '听觉学习' },
    { value: 'reading', label: '阅读学习' },
    { value: 'kinesthetic', label: '动手学习' }
  ],
  subjects: [
    { value: 'computer_basics', label: '计算机基础' },
    { value: 'data_structures', label: '数据结构' },
    { value: 'algorithms', label: '算法设计' },
    { value: 'web_dev', label: 'Web开发' },
    { value: 'data_science', label: '数据科学' },
    { value: 'ai', label: '人工智能' }
  ],
  selectedStyles: [],
  selectedSubjects: [],
  userPreferences: {
    learningStyles: [],
    targetSubjects: [],
    learningGoals: '',
  },
});

const viewTypes: Record<CategoryType, string> = {
  core: '核心知识',
  track: '学习轨道',
  resource: '学习资源',
  preference: '学习偏好',
  project: '项目',
  concept: '概念',
  skill: '技能',
};

const getCategoryType = (category: string): string => {
  const colors: Record<CategoryType, string> = {
    core: '#409EFF',
    track: '#67C23A',
    resource: '#E6A23C',
    preference: '#F56C6C',
    project: '#909399',
    concept: '#FF69B4',
    skill: '#8A2BE2',
  };
  return colors[category as CategoryType] || '信息';
};

const getViewName = (view: ViewType): string => {
  const viewNames: Record<ViewType, string> = {
    core: '核心知识视图',
    track: '学习轨道视图',
    resource: '资源关系视图',
    preference: '学习偏好视图',
    project: '项目视图',
    concept: '概念视图',
    skill: '技能视图',
  };
  return viewNames[view];
};

const resourceTypes: Record<ResourceType, string> = {
  video: '视频',
  document: '文档',
  project: '项目',
  quiz: '测验',
};

const categoryTypes: Record<CategoryType, string> = {
  core: '核心知识',
  track: '学习轨道',
  resource: '学习资源',
  preference: '学习偏好',
  project: '项目',
  concept: '概念',
  skill: '技能',
};

const getNodeColor = (category: string): string => {
  const colors: Record<CategoryType, string> = {
    core: '#409EFF',
    track: '#67C23A',
    resource: '#E6A23C',
    preference: '#F56C6C',
    project: '#909399',
    concept: '#FF69B4',
    skill: '#8A2BE2',
  };
  return colors[category as CategoryType] || '#909399';
};

const getLinkColor = (type: string | undefined): string => {
  return type === 'preference' ? '#E6A23C' : '#999'
}

// 方法
const showLoginDialog = () => {
  loginVisible.value = true
}

const handleLogin = () => {
  // 处理登录逻辑
  loginVisible.value = false
  showPreferenceDialog.value = true
}

const savePreferences = () => {
  // 保存学习偏好
  preferenceVisible.value = false
  // 更新知识图谱显示
  updateGraph()
}

const getNodeTypeTag = (type: string | undefined): string => {
  if (!type) return 'info'
  const types: Record<string, string> = {
    'preference': 'primary',
    'resource': 'success',
    'path': 'warning'
  }
  return types[type] || 'info'
}

const getResourceTypeTag = (type: string): string => {
  const types: Record<string, string> = {
    'video': 'primary',
    'document': 'success',
    'project': 'warning',
    'quiz': 'danger'
  }
  return types[type] || 'info'
}

const showResourceDetails = (resource: any) => {
  ElMessageBox.alert(
    `
    <div class="resource-details">
      <h4>${resource.title}</h4>
      <p>${resource.description}</p>
      <div class="meta-info">
        <p><strong>时长：</strong>${resource.duration}</p>
        <p><strong>难度：</strong>${resource.difficulty}</p>
        <p><strong>适合学习风格：</strong>${resource.learningStyle?.join(', ') || '不限'}</p>
      </div>
      <div class="action-links">
        <a href="${resource.url}" target="_blank">开始学习</a>
      </div>
    </div>
    `,
    '资源详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭',
      customClass: 'resource-details-dialog'
    }
  )
}

const startLearning = (resource: any) => {
  showResourceDetails(resource)
}

const handleNodeClick = (node: GraphNode) => {
  selectedNode.value = node
  
  const relatedNodeIds = new Set<string>([
    node.id,
    ...(node.prerequisites || [])
  ])

  // 更新节点和连接的样式
  d3.selectAll<SVGCircleElement, GraphNode>('circle')
    .attr('opacity', d => relatedNodeIds.has(d.id) ? 1 : 0.3)
}

const handleNodeHover = (event: MouseEvent, node: GraphNode) => {
  if (!event.currentTarget) return
  
  const element = event.currentTarget as SVGGElement
  d3.select(element)
    .select('circle')
    .transition()
    .duration(200)
    .attr('r', 30)
}

const handleNodeLeave = (event: MouseEvent, node: GraphNode) => {
  if (!event.currentTarget) return
  
  const element = event.currentTarget as SVGGElement
  d3.select(element)
    .select('circle')
    .transition()
    .duration(200)
    .attr('r', 25)
}

const resetHighlight = () => {
  d3.selectAll('circle').attr('opacity', 1)
  d3.selectAll('line').attr('opacity', 1)
}

const zoomToFit = () => {
  if (!graphContainer.value) return
  
  const svg = d3.select(graphContainer.value).select('svg')
  const width = graphContainer.value.clientWidth
  const height = 600
  
  const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      d3.select(graphContainer.value)
        .select('g')
        .attr('transform', event.transform)
    })
  
  svg.call(zoom)
  
  // 自动缩放以适应视图
  const bounds = (svg.select('g').node() as SVGGElement).getBBox()
  const fullWidth = bounds.width
  const fullHeight = bounds.height
  const scale = Math.min(width / fullWidth, height / fullHeight) * 0.9
  const x = width / 2 - (bounds.x + fullWidth / 2) * scale
  const y = height / 2 - (bounds.y + fullHeight / 2) * scale
  
  svg.transition()
    .duration(750)
    .call(zoom.transform as any, d3.zoomIdentity.translate(x, y).scale(scale))
}

const updateGraph = () => {
  if (!graphContainer.value) return;

  // Clear existing graph
  d3.select(graphContainer.value).selectAll('*').remove();

  const width = graphContainer.value.clientWidth;
  const height = 600;

  const svg = d3.select(graphContainer.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])
    .attr('style', 'max-width: 100%; height: auto;');

  // Load knowledge graph data
  const nodes = graphData.nodes;
  const links = graphData.links;

  // Add zoom behavior
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 5])
    .on('zoom', (event: any) => {
      svg.selectAll('g').attr('transform', event.transform);
    });

  svg.call(zoom);

  const g = svg.append('g');

  // Add arrow marker
  svg.append('defs').append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 15)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#999');

  // Force simulation
  const simulation = d3.forceSimulation(graphData.nodes as Node[])
    .force('link', d3.forceLink(graphData.links as Link[])
      .id((d: any) => d.id)
      .distance(150))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2));

  // Draw links
  const link = g.append('g')
    .selectAll<SVGLineElement, GraphLink>('line')
    .data(links)
    .join('line')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', 1)
    .attr('marker-end', 'url(#arrow)');

  // Draw nodes
  const node = g.append('g')
    .selectAll<SVGGElement, GraphNode>('g')
    .data(nodes)
    .join('g')
    .attr('cursor', 'pointer')
    .call(d3.drag<SVGGElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }));

  // Add circles to nodes
  node.append('circle')
    .attr('r', 20)
    .attr('fill', d => getNodeColor(d.category));

  // Add labels to nodes
  node.append('text')
    .attr('dy', 30)
    .attr('text-anchor', 'middle')
    .attr('fill', '#606266')
    .text(d => d.name);

  // Update positions
  simulation.on('tick', () => {
    link.attr('x1', d => (d.source as GraphNode).x)
        .attr('y1', d => (d.source as GraphNode).y)
        .attr('x2', d => (d.target as GraphNode).x)
        .attr('y2', d => (d.target as GraphNode).y);

    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });
};

const showUserMenu = () => {
  // 显示用户菜单的逻辑
};

const getProgressColor = (progress: number): string => {
  // 你的逻辑
};

onMounted(() => {
  updateGraph();
});

// 在视图切换时调用
watch(graphView, () => {
  updateGraph();
});
</script>

<style scoped>
.home {
  height: 100vh;
  background-color: var(--background-color);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.header-content h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #303133;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.knowledge-graph-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.graph-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.graph-filters {
  display: flex;
  gap: 20px;
}

.graph-visualization {
  width: 100%;
  height: 600px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 20px;
}

.graph-info {
  margin-top: 20px;
}

.node-info {
  max-width: 400px;
  margin: 0 auto;
}

.matched-styles {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.style-tag {
  margin-right: 8px;
}

.node-resources {
  margin-top: 20px;
}

.resource-details {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.resource-details h5 {
  margin: 0 0 10px 0;
  color: #303133;
}

.resource-meta {
  display: flex;
  gap: 15px;
  color: #606266;
  font-size: 0.9em;
  margin: 10px 0;
}

.dashboard-section {
  margin-top: 20px;
}

.progress-card,
.recommendation-card,
.learning-path-card {
  height: 100%;
}

.progress-item {
  margin-bottom: 15px;
}

.progress-item span {
  display: block;
  margin-bottom: 5px;
  color: #606266;
}

:deep(.el-timeline-item__content h4) {
  margin: 0;
  color: #303133;
}

:deep(.el-timeline-item__content p) {
  margin: 5px 0;
  color: #606266;
}

:deep(.el-step__title) {
  font-size: 14px;
}

:deep(.el-step__description) {
  font-size: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 