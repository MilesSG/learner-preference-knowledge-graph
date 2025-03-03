import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { LearningPreference, PreferenceQuestion } from '../types/preference';

const STORAGE_KEY = 'learning_preferences';

export const usePreferenceStore = defineStore('preference', () => {
  const currentPreference = ref<LearningPreference | null>(null);
  const savedPreferences = ref<LearningPreference[]>([]);

  const questions = ref<PreferenceQuestion[]>([
    {
      id: 'ls-1',
      category: 'learningStyle',
      question: '您更倾向于通过视觉材料（如图表、视频）学习吗？',
      type: 'slider',
      min: 0,
      max: 100
    },
    {
      id: 'ls-2',
      category: 'learningStyle',
      question: '您更倾向于通过听讲或音频材料学习吗？',
      type: 'slider',
      min: 0,
      max: 100
    },
    {
      id: 'sp-1',
      category: 'subjectPreference',
      question: '您最感兴趣的学科领域是？',
      type: 'multiSelect',
      options: ['计算机科学', '数学', '物理', '化学', '生物']
    },
    {
      id: 'tp-1',
      category: 'timePreference',
      question: '您最适合学习的时间段是？',
      type: 'multiSelect',
      options: ['早晨', '上午', '下午', '晚上', '深夜']
    }
  ]);

  const isPreferenceComplete = computed(() => {
    return currentPreference.value !== null;
  });

  // 从本地存储加载数据
  function loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        savedPreferences.value = JSON.parse(stored);
      }
    } catch (error) {
      console.error('从本地存储加载偏好失败:', error);
    }
  }

  // 保存到本地存储
  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPreferences.value));
    } catch (error) {
      console.error('保存偏好到本地存储失败:', error);
    }
  }

  async function savePreference(preference: Partial<LearningPreference>) {
    try {
      const newPreference = {
        ...currentPreference.value,
        ...preference,
        id: Date.now().toString(),
        updatedAt: new Date().toISOString()
      } as LearningPreference;

      currentPreference.value = newPreference;
      savedPreferences.value = [newPreference, ...savedPreferences.value];
      saveToStorage();
      return true;
    } catch (error) {
      console.error('保存学习偏好失败:', error);
      return false;
    }
  }

  async function loadPreference(userId: string) {
    try {
      loadFromStorage();
      // 初始化新的偏好设置
      currentPreference.value = {
        id: Date.now().toString(),
        userId,
        subjectPreferences: {},
        timePreference: {
          preferredTime: [],
          studyDuration: 0
        },
        learningStyle: {
          visual: 0,
          auditory: 0,
          reading: 0,
          kinesthetic: 0
        },
        difficultyPreference: 50,
        interactivityPreference: 50,
        socialLearning: false,
        answers: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('加载学习偏好失败:', error);
    }
  }

  function getQuestionById(id: string): PreferenceQuestion | undefined {
    return questions.value.find(q => q.id === id);
  }

  return {
    currentPreference,
    savedPreferences,
    questions,
    isPreferenceComplete,
    savePreference,
    loadPreference,
    getQuestionById
  };
}); 