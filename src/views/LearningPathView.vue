<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useLearningStore } from '../stores/learning';
import { usePreferenceStore } from '../stores/preference';
import type { KnowledgeNode, ResourceRecommendation } from '../types/learning';
import { 
  VideoPlay, 
  Reading, 
  Document, 
  QuestionFilled,
  Connection,
  Timer,
  Medal
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const learningStore = useLearningStore();
const preferenceStore = usePreferenceStore();

const loading = ref(false);
const activeNode = ref<KnowledgeNode | null>(null);
const selectedResources = ref<ResourceRecommendation[]>([]);

const resourceTypeIcons = {
  video: VideoPlay,
  article: Document,
  quiz: QuestionFilled,
  exercise: Reading,
  project: Connection
};

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

onMounted(async () => {
  await generatePath();
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
        <el-button type="primary" @click="generatePath" :loading="loading">
          重新生成路径
        </el-button>
      </div>
    </div>

    <div v-if="!preferenceStore.currentPreference" class="empty-state">
      <el-empty description="请先完成学习偏好设置">
        <el-button type="primary" @click="$router.push('/preference-settings')">
          去设置
        </el-button>
      </el-empty>
    </div>

    <div v-else-if="!learningStore.currentPath && !loading" class="empty-state">
      <el-empty description="暂无学习路径">
        <el-button type="primary" @click="generatePath">
          生成学习路径
        </el-button>
      </el-empty>
    </div>

    <div v-else-if="learningStore.currentPath" class="grid grid-cols-12 gap-8">
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

          <el-steps direction="vertical" :active="1">
            <el-step
              v-for="node in learningStore.currentPath.nodes"
              :key="node.id"
              :title="node.title"
              :description="node.description"
              @click="handleNodeClick(node)"
              class="cursor-pointer"
            >
              <template #icon>
                <el-icon>
                  <Connection v-if="node === activeNode" />
                  <Medal v-else-if="node.difficulty <= 2" />
                  <Timer v-else />
                </el-icon>
              </template>
            </el-step>
          </el-steps>
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

          <div class="space-y-6">
            <div v-for="rec in selectedResources" :key="rec.resource.id" class="resource-item">
              <el-card shadow="hover" class="resource-detail">
                <div class="flex items-start">
                  <el-icon :size="24" class="mr-4 text-blue-500">
                    <component :is="resourceTypeIcons[rec.resource.type]" />
                  </el-icon>
                  
                  <div class="flex-grow">
                    <div class="flex justify-between items-start">
                      <div>
                        <h3 class="text-lg font-medium">
                          {{ rec.resource.title }}
                        </h3>
                        <p class="text-gray-600 mt-1">
                          {{ rec.resource.description }}
                        </p>
                      </div>
                      <el-button type="primary" link :icon="VideoPlay">
                        开始学习
                      </el-button>
                    </div>

                    <div class="mt-4">
                      <el-tag 
                        v-for="reason in rec.reasons" 
                        :key="reason"
                        class="mr-2 mb-2"
                        type="success"
                      >
                        {{ reason }}
                      </el-tag>
                    </div>

                    <div class="mt-4 flex items-center text-sm text-gray-500">
                      <el-icon class="mr-1"><Timer /></el-icon>
                      {{ rec.resource.duration }} 分钟
                      <span class="mx-2">|</span>
                      匹配度: {{ Math.round(rec.matchScore) }}%
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </el-card>

        <div v-else class="text-center py-8">
          <el-empty description="请选择一个知识点开始学习" />
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

.path-card {
  position: sticky;
  top: 2rem;
}

.resource-card {
  min-height: 600px;
}

.resource-item {
  transition: all 0.3s ease;
}

.resource-detail {
  transition: all 0.3s ease;
}

.resource-detail:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-step__title) {
  font-size: 1rem;
  line-height: 1.5;
}

:deep(.el-step__description) {
  font-size: 0.875rem;
}

:deep(.el-step.is-vertical) {
  cursor: pointer;
}

:deep(.el-step__head.is-finish) {
  color: #409EFF;
  border-color: #409EFF;
}

.empty-state {
  margin: 100px auto;
  text-align: center;
}
</style> 