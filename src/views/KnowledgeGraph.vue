<template>
  <el-container class="knowledge-graph">
    <el-aside width="300px">
      <el-card class="filter-card">
        <template #header>
          <div class="card-header">
            <h3>筛选条件</h3>
          </div>
        </template>
        <el-form>
          <el-form-item label="节点类型">
            <el-select v-model="filters.category" multiple placeholder="选择节点类型">
              <el-option label="学习偏好" value="preference" />
              <el-option label="学习风格" value="learning_style" />
              <el-option label="资源类型" value="resource_type" />
              <el-option label="学科领域" value="subject" />
            </el-select>
          </el-form-item>
          <el-form-item label="学习风格">
            <el-select v-model="filters.learningStyle" multiple placeholder="选择学习风格">
              <el-option label="视觉学习" value="visual_learning" />
              <el-option label="听觉学习" value="auditory_learning" />
              <el-option label="动手学习" value="kinesthetic_learning" />
              <el-option label="阅读学习" value="reading_learning" />
            </el-select>
          </el-form-item>
          <el-form-item label="资源类型">
            <el-select v-model="filters.resourceType" multiple placeholder="选择资源类型">
              <el-option label="视频资源" value="video_resource" />
              <el-option label="文本资源" value="text_resource" />
              <el-option label="交互资源" value="interactive_resource" />
              <el-option label="音频资源" value="audio_resource" />
            </el-select>
          </el-form-item>
        </el-form>
      </el-card>
      
      <el-card class="node-info" v-if="selectedNode">
        <template #header>
          <div class="card-header">
            <h3>{{ selectedNode.name }}</h3>
          </div>
        </template>
        <div class="node-details">
          <p><strong>难度等级：</strong> Level {{ selectedNode.difficulty }}</p>
          <p><strong>类别：</strong> {{ getCategoryName(selectedNode.category) }}</p>
          <p><strong>前置知识：</strong></p>
          <el-tag
            v-for="prereq in selectedNode.prerequisites"
            :key="prereq"
            size="small"
            class="prereq-tag"
          >
            {{ getNodeName(prereq) }}
          </el-tag>
          
          <div class="resources-section" v-if="nodeResources.length">
            <h4>相关学习资源</h4>
            <el-collapse>
              <el-collapse-item
                v-for="resource in nodeResources"
                :key="resource.id"
                :title="resource.title"
              >
                <p><strong>类型：</strong> {{ resource.type }}</p>
                <p><strong>难度：</strong> {{ resource.difficulty }}</p>
                <p v-if="resource.duration"><strong>时长：</strong> {{ resource.duration }}</p>
                <p v-if="resource.pages"><strong>页数：</strong> {{ resource.pages }}</p>
                <el-button type="primary" size="small" @click="window.open(resource.url)">
                  开始学习
                </el-button>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </el-card>
    </el-aside>
    
    <el-main>
      <div ref="graphContainer" class="graph-container"></div>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import * as d3 from 'd3'
import graphData from '../assets/data/knowledge-graph.json'

interface Node extends d3.SimulationNodeDatum {
  id: string
  name: string
  category: string
  difficulty: number
  description: string
  prerequisites: string[]
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node
  target: string | Node
  value: number
}

interface Resource {
  id: string
  title: string
  type: string
  url: string
  duration?: string
  difficulty: string
  pages?: number
}

interface DragEvent {
  active: boolean
  subject: Node
  x: number
  y: number
}

const graphContainer = ref<HTMLElement | null>(null)
const selectedNode = ref<Node | null>(null)
const filters = reactive({
  category: [] as string[],
  learningStyle: [] as string[],
  resourceType: [] as string[]
})

const nodeResources = computed(() => {
  if (!selectedNode.value) return []
  return (graphData.resources as Record<string, Resource[]>)[selectedNode.value.id] || []
})

const getCategoryName = (category: string): string => {
  const categories: Record<string, string> = {
    preference: '学习偏好',
    learning_style: '学习风格',
    resource_type: '资源类型',
    subject: '学科领域'
  }
  return categories[category] || category
}

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    preference: '#409EFF',
    learning_style: '#67C23A',
    resource_type: '#E6A23C',
    subject: '#F56C6C'
  }
  return colors[category] || '#909399'
}

const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    preference: '',
    learning_style: '',
    resource_type: '',
    subject: ''
  }
  return icons[category] || ''
}

const getNodeName = (id: string): string => {
  const node = graphData.nodes.find(n => n.id === id)
  return node ? node.name : id
}

onMounted(() => {
  if (!graphContainer.value) return

  const width = graphContainer.value.clientWidth
  const height = graphContainer.value.clientHeight || 800

  const svg = d3.select(graphContainer.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  svg.append('defs').append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '-0 -5 10 10')
    .attr('refX', 30)
    .attr('refY', 0)
    .attr('orient', 'auto')
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('xoverflow', 'visible')
    .append('svg:path')
    .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
    .attr('fill', '#999')
    .style('stroke', 'none')

  const simulation = d3.forceSimulation(graphData.nodes as Node[])
    .force('link', d3.forceLink(graphData.links as Link[])
      .id((d: any) => d.id)
      .distance(100))
    .force('charge', d3.forceManyBody().strength(-1000))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(60))

  const links = svg.append('g')
    .selectAll('line')
    .data(graphData.links)
    .join('line')
    .attr('stroke', d => (d as Link).type === 'preference' ? '#E6A23C' : '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', d => Math.sqrt((d as Link).value))
    .attr('marker-end', 'url(#arrowhead)')

  const nodes = svg.append('g')
    .selectAll('g')
    .data(graphData.nodes)
    .join('g')
    .call(d3.drag<any, any>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended))
    .on('click', (event, d) => {
      selectedNode.value = d as Node
    })

  nodes.append('circle')
    .attr('r', 25)
    .attr('fill', d => getCategoryColor((d as Node).category))
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)

  nodes.append('text')
    .text(d => (d as Node).name)
    .attr('text-anchor', 'middle')
    .attr('dy', 35)
    .attr('font-size', '12px')
    .attr('fill', '#303133')

  nodes.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', 5)
    .attr('font-family', 'element-icons')
    .attr('font-size', '16px')
    .attr('fill', '#fff')
    .text(d => getCategoryIcon((d as Node).category))

  simulation.on('tick', () => {
    links
      .attr('x1', d => (d.source as any).x)
      .attr('y1', d => (d.source as any).y)
      .attr('x2', d => (d.target as any).x)
      .attr('y2', d => (d.target as any).y)

    nodes.attr('transform', d => `translate(${(d as any).x},${(d as any).y})`)
  })

  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 5])
    .on('zoom', (event) => {
      svg.selectAll('g').attr('transform', event.transform)
    })

  svg.call(zoom as any)

  function dragstarted(event: any) {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    event.subject.fx = event.subject.x
    event.subject.fy = event.subject.y
  }

  function dragged(event: any) {
    event.subject.fx = event.x
    event.subject.fy = event.y
  }

  function dragended(event: any) {
    if (!event.active) simulation.alphaTarget(0)
    event.subject.fx = null
    event.subject.fy = null
  }
})
</script>

<style scoped>
.knowledge-graph {
  height: 100vh;
}

.filter-card {
  margin-bottom: 20px;
}

.node-info {
  margin-top: 20px;
}

.graph-container {
  width: 100%;
  height: 100%;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.prereq-tag {
  margin: 5px;
}

.resources-section {
  margin-top: 20px;
}

.resources-section h4 {
  margin-bottom: 10px;
}

:deep(.el-aside) {
  padding: 20px;
  background-color: #f5f7fa;
}

:deep(.el-main) {
  padding: 20px;
}
</style> 