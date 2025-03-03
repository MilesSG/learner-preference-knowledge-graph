<script setup lang="ts">
import { usePreferenceStore } from '../stores/preference';
import { computed } from 'vue';
import { Delete, Edit } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';

const router = useRouter();
const preferenceStore = usePreferenceStore();

const formattedPreferences = computed(() => {
  return preferenceStore.savedPreferences.map(pref => {
    const learningStyle = Object.entries(pref.learningStyle)
      .map(([key, value]) => ({
        key: key === 'visual' ? '视觉' : 
             key === 'auditory' ? '听觉' :
             key === 'reading' ? '阅读' : '动手',
        value
      }))
      .filter(item => item.value > 0);

    const subjects = pref.answers['sp-1'] as string[] || [];
    const timeSlots = pref.answers['tp-1'] as string[] || [];

    return {
      ...pref,
      formattedDate: new Date(pref.updatedAt).toLocaleString(),
      learningStyle,
      subjects,
      timeSlots
    };
  });
});

async function handleDelete(id: string) {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个学习偏好记录吗？',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    preferenceStore.savedPreferences = preferenceStore.savedPreferences.filter(
      p => p.id !== id
    );
    localStorage.setItem(
      'learning_preferences',
      JSON.stringify(preferenceStore.savedPreferences)
    );
  } catch {
    // 用户取消删除
  }
}

function handleEdit() {
  router.push('/preference-settings');
}
</script>

<template>
  <div class="preference-list">
    <div class="header-section mb-8">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">我的学习偏好</h1>
          <p class="text-gray-600 mt-2">查看和管理您保存的所有学习偏好设置</p>
        </div>
        <el-button type="primary" @click="handleEdit">
          <el-icon class="mr-1"><Edit /></el-icon>
          新建偏好设置
        </el-button>
      </div>
    </div>

    <div v-if="formattedPreferences.length === 0" class="empty-state">
      <el-empty description="暂无保存的学习偏好">
        <template #extra>
          <el-button type="primary" @click="handleEdit">
            <el-icon class="mr-1"><Edit /></el-icon>
            创建学习偏好
          </el-button>
        </template>
      </el-empty>
    </div>

    <div v-else class="grid gap-8 md:grid-cols-2">
      <el-card
        v-for="pref in formattedPreferences"
        :key="pref.id"
        class="preference-card"
        shadow="hover"
      >
        <template #header>
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <span class="font-medium text-lg">学习偏好设置</span>
              <el-tag size="small" type="success" class="ml-3">已保存</el-tag>
            </div>
            <div class="flex gap-2">
              <el-button
                type="danger"
                :icon="Delete"
                circle
                @click="handleDelete(pref.id)"
              />
            </div>
          </div>
        </template>

        <div class="space-y-6">
          <div class="preference-item" v-if="pref.learningStyle.length > 0">
            <h3 class="text-sm font-medium text-gray-500">学习风格</h3>
            <div class="mt-2 flex flex-wrap gap-2">
              <el-progress
                v-for="style in pref.learningStyle"
                :key="style.key"
                :percentage="style.value"
                :stroke-width="10"
                :text-inside="true"
                :format="() => style.key"
                class="style-progress"
              />
            </div>
          </div>

          <div class="preference-item" v-if="pref.subjects.length > 0">
            <h3 class="text-sm font-medium text-gray-500">感兴趣的学科</h3>
            <div class="mt-2 flex flex-wrap gap-2">
              <el-tag
                v-for="subject in pref.subjects"
                :key="subject"
                class="subject-tag"
              >
                {{ subject }}
              </el-tag>
            </div>
          </div>

          <div class="preference-item" v-if="pref.timeSlots.length > 0">
            <h3 class="text-sm font-medium text-gray-500">学习时间偏好</h3>
            <div class="mt-2 flex flex-wrap gap-2">
              <el-tag
                v-for="time in pref.timeSlots"
                :key="time"
                type="info"
                class="time-tag"
              >
                {{ time }}
              </el-tag>
            </div>
          </div>

          <div class="preference-item">
            <h3 class="text-sm font-medium text-gray-500">更新时间</h3>
            <p class="mt-1 text-sm text-gray-400">{{ pref.formattedDate }}</p>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.preference-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.empty-state {
  background: white;
  border-radius: 8px;
  padding: 4rem;
  text-align: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.preference-card {
  transition: all 0.3s ease;
  height: 100%;
}

.preference-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.preference-item:not(:last-child) {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1.5rem;
}

.style-progress {
  width: 150px;
  margin-bottom: 0.5rem;
}

.subject-tag {
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
}

.time-tag {
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
}

:deep(.el-progress-bar__inner) {
  transition: all 0.3s ease;
}

:deep(.el-card__header) {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.el-card__body) {
  padding: 1.25rem;
}

:deep(.el-tag) {
  border-radius: 4px;
}

:deep(.el-button) {
  font-weight: 500;
}
</style> 