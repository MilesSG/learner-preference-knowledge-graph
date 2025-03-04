<script setup lang="ts">
import { usePreferenceStore } from '../stores/preference';
import { computed, ref } from 'vue';
import { Delete, Edit, View, More } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';

const router = useRouter();
const preferenceStore = usePreferenceStore();

// 分页配置
const currentPage = ref(1);
const pageSize = ref(6); // 每页6个卡片

// 样式主题颜色映射
const styleColors: Record<string, string> = {
  visual: '#409EFF',
  auditory: '#67C23A',
  reading: '#E6A23C',
  kinesthetic: '#F56C6C'
};

// 随机背景图片 - 根据不同的学习风格提供不同背景
const backgroundImages = [
  '/images/visual-learning.jpg',
  '/images/audio-learning.jpg', 
  '/images/reading-learning.jpg',
  '/images/hands-on-learning.jpg'
];

interface StyleItem {
  key: string;
  value: number;
  type: string;
}

const getStyleImage = (styles: StyleItem[] | undefined): string => {
  if (!styles || styles.length === 0) return backgroundImages[3];
  // 查找最高比例的学习风格
  const dominantStyle = styles.reduce((max: StyleItem, current: StyleItem) => 
    current.value > max.value ? current : max, { value: 0 } as StyleItem);
  
  if (dominantStyle.key === '视觉') return backgroundImages[0];
  if (dominantStyle.key === '听觉') return backgroundImages[1];
  if (dominantStyle.key === '阅读') return backgroundImages[2];
  return backgroundImages[3]; // 默认动手学习
};

const formattedPreferences = computed(() => {
  return preferenceStore.savedPreferences.map(pref => {
    const learningStyle = Object.entries(pref.learningStyle)
      .map(([key, value]) => ({
        key: key === 'visual' ? '视觉' : 
             key === 'auditory' ? '听觉' :
             key === 'reading' ? '阅读' : '动手',
        value,
        type: key
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value); // 按照值从大到小排序

    const subjects = pref.answers['sp-1'] as string[] || [];
    const timeSlots = pref.answers['tp-1'] as string[] || [];

    // 获取主要学习风格
    const mainStyle = learningStyle.length > 0 ? learningStyle[0].key : '未设置';
    
    // 构建简短描述
    let brief = `您的主要学习风格是${mainStyle}`;
    if (subjects.length > 0) {
      brief += `，专注于${subjects.slice(0, 2).join('、')}${subjects.length > 2 ? '等' : ''}学科`;
    }
    if (timeSlots.length > 0) {
      brief += `，倾向于在${timeSlots.slice(0, 2).join('、')}${timeSlots.length > 2 ? '等时段' : ''}学习`;
    }

    return {
      ...pref,
      formattedDate: new Date(pref.updatedAt).toLocaleString(),
      learningStyle,
      subjects,
      timeSlots,
      mainStyle,
      brief,
      backgroundImage: getStyleImage(learningStyle)
    };
  });
});

// 分页处理后的偏好列表
const paginatedPreferences = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return formattedPreferences.value.slice(start, end);
});

// 总页数
const totalPages = computed(() => {
  return Math.ceil(formattedPreferences.value.length / pageSize.value);
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
    
    // 检查删除后是否需要调整页码
    if (paginatedPreferences.value.length === 0 && currentPage.value > 1) {
      currentPage.value--;
    }
  } catch {
    // 用户取消删除
  }
}

function handleEdit() {
  router.push('/preference-settings');
}

function handleView(id: string) {
  // 查看详情逻辑，可以跳转到详情页或者显示详细信息
  console.log('查看详情:', id);
  ElMessageBox.alert(
    `您可以在此查看偏好详情并进行学习规划`,
    '学习偏好详情',
    {
      confirmButtonText: '确定'
    }
  );
}

function handlePageChange(page: number) {
  currentPage.value = page;
}
</script>

<template>
  <div class="preference-list">
    <div class="header-section">
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

    <div v-else>
      <!-- 新闻卡片风格布局 -->
      <div class="ax-grid">
        <div 
          v-for="pref in paginatedPreferences" 
          :key="pref.id"
          class="ax-card"
        >
          <!-- 卡片头部 -->
          <div class="ax-card-header">
            <div class="poster" :style="{ backgroundImage: `url(${pref.backgroundImage || '/images/default-learning.jpg'})` }">
              <div class="poster-overlay">
                <span class="pref-date">{{ pref.formattedDate.split(' ')[0] }}</span>
              </div>
            </div>
          </div>
          
          <!-- 卡片内容 -->
          <div class="ax-card-body">
            <div class="caption">
              <h3>{{ pref.mainStyle }}学习者的个性化学习方案</h3>
              <div class="style-indicators">
                <div 
                  v-for="style in pref.learningStyle.slice(0, 2)" 
                  :key="style.key"
                  class="style-indicator"
                >
                  <div class="style-label">{{ style.key }}</div>
                  <div class="style-bar-container">
                    <div class="style-bar" :style="{ width: `${style.value}%`, backgroundColor: styleColors[style.type as keyof typeof styleColors] }"></div>
                  </div>
                  <div class="style-value">{{ style.value }}%</div>
                </div>
              </div>
            </div>
            
            <div class="brief">
              {{ pref.brief }}
            </div>
            
            <div class="byline-keywords">
              <div class="keywords">
                <span 
                  v-for="subject in pref.subjects.slice(0, 3)" 
                  :key="subject"
                  class="keyword"
                >{{ subject }}</span>
                
                <span 
                  v-for="time in pref.timeSlots.slice(0, 2)" 
                  :key="time"
                  class="keyword time"
                >{{ time }}</span>
              </div>
            </div>
          </div>
          
          <!-- 卡片底部 -->
          <div class="ax-card-footer">
            <span class="views-count">
              <el-icon><View /></el-icon> 个性化学习计划
            </span>
            
            <div class="actions">
              <el-button 
                type="text" 
                size="small"
                @click="handleView(pref.id)"
              >
                查看详情
              </el-button>
              
              <el-dropdown trigger="click">
                <el-button 
                  type="text" 
                  size="small"
                >
                  <el-icon><More /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleEdit">
                      <el-icon><Edit /></el-icon> 编辑
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleDelete(pref.id)" class="text-danger">
                      <el-icon><Delete /></el-icon> 删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-if="totalPages > 1"
          layout="prev, pager, next"
          :total="formattedPreferences.length"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
          background
          class="mt-8"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.preference-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header-section {
  margin-bottom: 2rem;
}

.empty-state {
  background: white;
  border-radius: 8px;
  padding: 4rem;
  text-align: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 新闻卡片网格布局 */
.ax-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .ax-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .ax-grid {
    grid-template-columns: 1fr;
  }
  
  .preference-list {
    padding: 1rem;
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
}

.ax-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
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

.pref-date {
  font-size: 0.875rem;
  font-weight: 500;
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
  font-size: 1.125rem;
  font-weight: 600;
  color: #303133;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
}

.style-indicators {
  margin-top: 0.75rem;
}

.style-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.style-label {
  width: 40px;
  font-size: 0.875rem;
  color: #606266;
}

.style-bar-container {
  flex-grow: 1;
  height: 8px;
  background-color: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
  margin: 0 0.5rem;
}

.style-bar {
  height: 100%;
  border-radius: 4px;
}

.style-value {
  width: 36px;
  font-size: 0.75rem;
  color: #909399;
  text-align: right;
}

.brief {
  font-size: 0.875rem;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 1rem;
  flex-grow: 1;
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

.keyword.time {
  background-color: #ecf5ff;
  color: #409eff;
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
  gap: 0.5rem;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.text-danger {
  color: #F56C6C;
}

:deep(.el-button) {
  font-weight: 500;
}
</style> 