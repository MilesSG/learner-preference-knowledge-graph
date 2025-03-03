<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePreferenceStore } from '../stores/preference';
import type { PreferenceQuestion } from '../types/preference';
import { ElMessage } from 'element-plus';
import { 
  Check, 
  ArrowLeft, 
  ArrowRight,
  Reading,
  Collection,
  Timer,
  Setting
} from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const preferenceStore = usePreferenceStore();
const activeStep = ref(0);
const loading = ref(false);
const router = useRouter();

const steps = [
  { title: '学习风格', description: '了解您的学习方式偏好', icon: Reading },
  { title: '学科兴趣', description: '选择您感兴趣的学科', icon: Collection },
  { title: '时间安排', description: '设置您的学习时间偏好', icon: Timer },
  { title: '其他设置', description: '个性化您的学习体验', icon: Setting }
];

const currentQuestions = ref<PreferenceQuestion[]>([]);

onMounted(async () => {
  await preferenceStore.loadPreference('user-1');
  updateCurrentQuestions();
});

function updateCurrentQuestions() {
  const categories = ['learningStyle', 'subjectPreference', 'timePreference', 'general'];
  currentQuestions.value = preferenceStore.questions.filter(
    q => q.category === categories[activeStep.value]
  );
}

function getAnswer(questionId: string) {
  return preferenceStore.currentPreference?.answers?.[questionId] ?? null;
}

function setAnswer(questionId: string, value: number | string[] | boolean) {
  if (preferenceStore.currentPreference) {
    if (!preferenceStore.currentPreference.answers) {
      preferenceStore.currentPreference.answers = {};
    }
    preferenceStore.currentPreference.answers[questionId] = value;
  }
}

async function handleNext() {
  if (activeStep.value < steps.length - 1) {
    activeStep.value++;
    updateCurrentQuestions();
  } else {
    await handleSubmit();
  }
}

async function handleSubmit() {
  loading.value = true;
  try {
    if (preferenceStore.currentPreference) {
      const answers = preferenceStore.currentPreference.answers || {};
      const updatedPreference = {
        ...preferenceStore.currentPreference,
        learningStyle: {
          visual: Number(answers['ls-1'] ?? 0),
          auditory: Number(answers['ls-2'] ?? 0),
          reading: 0,
          kinesthetic: 0
        },
      };
      
      await preferenceStore.savePreference(updatedPreference);
      ElMessage({
        message: '学习偏好保存成功！',
        type: 'success',
        duration: 2000
      });
      
      // 保存成功后跳转到偏好列表页面
      router.push('/preference-list');
    }
  } catch (error) {
    ElMessage({
      message: '保存失败，请重试',
      type: 'error',
      duration: 2000
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="preference-settings">
    <div class="header-section mb-8">
      <h1 class="text-2xl font-bold text-gray-900">个性化学习偏好设置</h1>
      <p class="text-gray-600 mt-2">根据您的学习习惯和偏好，为您提供个性化的学习体验</p>
    </div>
    
    <el-card class="mb-8 steps-card">
      <el-steps :active="activeStep" finish-status="success" align-center>
        <el-step
          v-for="step in steps"
          :key="step.title"
          :title="step.title"
          :description="step.description"
        >
          <template #icon>
            <el-icon><component :is="step.icon" /></el-icon>
          </template>
        </el-step>
      </el-steps>
    </el-card>

    <el-card class="question-card">
      <template #header>
        <div class="card-header">
          <h2 class="text-lg font-medium">{{ steps[activeStep].title }}</h2>
          <span class="text-gray-500">{{ `${activeStep + 1} / ${steps.length}` }}</span>
        </div>
      </template>

      <div v-if="currentQuestions.length > 0" class="space-y-8">
        <div
          v-for="question in currentQuestions"
          :key="question.id"
          class="question-item"
        >
          <h3 class="text-base font-medium text-gray-800 mb-4">
            {{ question.question }}
          </h3>

          <div class="answer-input">
            <template v-if="question.type === 'slider'">
              <el-slider
                :model-value="getAnswer(question.id)"
                @update:model-value="(value: number) => setAnswer(question.id, value)"
                :min="question.min"
                :max="question.max"
                :step="1"
                :show-input="true"
                :format-tooltip="(value: number) => `${value}%`"
                class="preference-slider"
              />
            </template>

            <template v-else-if="question.type === 'multiSelect'">
              <el-checkbox-group 
                :model-value="(getAnswer(question.id) || []) as string[]"
                @update:model-value="(value: string[]) => setAnswer(question.id, value)"
                class="checkbox-grid"
              >
                <el-checkbox
                  v-for="option in question.options"
                  :key="option"
                  :label="option"
                  border
                  class="preference-checkbox"
                />
              </el-checkbox-group>
            </template>

            <template v-else-if="question.type === 'singleSelect'">
              <el-radio-group 
                :model-value="(getAnswer(question.id) || '') as string"
                @update:model-value="(value: string) => setAnswer(question.id, [value])"
                class="radio-grid"
              >
                <el-radio
                  v-for="option in question.options"
                  :key="option"
                  :label="option"
                  border
                  class="preference-radio"
                />
              </el-radio-group>
            </template>

            <template v-else-if="question.type === 'boolean'">
              <el-switch
                :model-value="!!getAnswer(question.id)"
                @update:model-value="(value: boolean) => setAnswer(question.id, value)"
                active-text="是"
                inactive-text="否"
                class="preference-switch"
              />
            </template>
          </div>
        </div>
      </div>

      <div class="flex justify-between mt-8">
        <el-button
          @click="activeStep--"
          :disabled="activeStep === 0"
          :icon="ArrowLeft"
        >
          上一步
        </el-button>
        
        <el-button
          type="primary"
          @click="handleNext"
          :loading="loading"
          :icon="activeStep === steps.length - 1 ? Check : ArrowRight"
        >
          {{ activeStep === steps.length - 1 ? '完成' : '下一步' }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.preference-settings {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.steps-card :deep(.el-step__title) {
  font-size: 1rem;
}

.steps-card :deep(.el-step__description) {
  font-size: 0.875rem;
}

.question-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.question-item {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.question-item:last-child {
  border-bottom: none;
}

.checkbox-grid,
.radio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.preference-checkbox,
.preference-radio {
  margin-right: 0;
  width: 100%;
}

.preference-slider {
  width: 100%;
  padding: 1rem 0;
}

.preference-switch {
  display: flex;
  align-items: center;
  height: 40px;
}

:deep(.el-step__icon) {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-button) {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
</style> 