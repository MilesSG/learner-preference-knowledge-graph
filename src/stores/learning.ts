import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { 
  LearningResource, 
  KnowledgeNode, 
  LearningPath,
  ResourceRecommendation 
} from '../types/learning';
import { usePreferenceStore } from './preference';

// 定义更多的资源类型
const resourceTypes = {
  video: '视频课程',
  article: '文章教程',
  quiz: '测试题',
  exercise: '练习',
  project: '项目实战',
  interactive: '交互式学习',
  ebook: '电子书',
  course: '系统课程'
} as const;

// 模拟的知识图谱数据
const mockKnowledgeGraph: KnowledgeNode[] = [
  // 计算机科学路径
  {
    id: 'cs1',
    title: '计算机科学导论',
    description: '了解计算机科学的基本概念、发展历史和应用领域',
    subject: '计算机科学',
    coverImage: 'https://images.unsplash.com/photo-1517134191118-9d595e4c8c2b?q=80&w=1000',
    prerequisites: [],
    nextNodes: ['cs2', 'cs3'],
    resources: [
      {
        id: 'cs1_r1',
        title: '计算机科学速成课',
        description: '通过生动的视频动画了解计算机科学的核心概念',
        type: 'video',
        subject: '计算机科学',
        coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000',
        difficulty: 1,
        duration: 45,
        author: '计算机科学学院',
        url: 'https://example.com/cs-crash-course',
        tags: ['计算机基础', '入门', '视频教程'],
        visualScore: 95,
        auditoryScore: 85,
        readingScore: 60,
        kinestheticScore: 40,
        chapters: [
          '计算机发展历史',
          '计算机硬件基础',
          '操作系统概述',
          '网络通信基础',
          '程序设计入门'
        ]
      },
      {
        id: 'cs1_r2',
        title: '计算机科学漫谈',
        description: '通过有趣的文章了解计算机科学的发展历程',
        type: 'article',
        subject: '计算机科学',
        coverImage: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1000',
        difficulty: 1,
        duration: 30,
        author: '科技文化研究所',
        url: 'https://example.com/cs-history',
        tags: ['计算机历史', '科普', '文章'],
        visualScore: 50,
        auditoryScore: 40,
        readingScore: 90,
        kinestheticScore: 30,
        relatedResources: ['计算机先驱者传记', '图灵机简史', '现代计算机发展里程碑']
      }
    ],
    difficulty: 1,
    estimatedDuration: 120
  },
  {
    id: 'cs2',
    title: 'Python编程基础',
    description: '学习Python编程语言的基本语法和编程思维',
    subject: '计算机科学',
    coverImage: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?q=80&w=1000',
    prerequisites: ['cs1'],
    nextNodes: ['cs4'],
    resources: [
      {
        id: 'cs2_r1',
        title: 'Python交互式教程',
        description: '通过实践练习学习Python基础语法',
        type: 'interactive',
        subject: '计算机科学',
        coverImage: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1000',
        difficulty: 2,
        duration: 60,
        author: 'Python教育联盟',
        url: 'https://example.com/python-basics',
        tags: ['Python', '编程实践', '互动学习'],
        visualScore: 70,
        auditoryScore: 50,
        readingScore: 80,
        kinestheticScore: 90,
        exercises: [
          '变量与数据类型',
          '控制流程',
          '函数定义',
          '面向对象基础',
          '文件操作'
        ]
      },
      {
        id: 'cs2_r2',
        title: 'Python游戏开发实战',
        description: '通过制作简单游戏学习Python编程',
        type: 'project',
        subject: '计算机科学',
        coverImage: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1000',
        difficulty: 2,
        duration: 120,
        author: '游戏开发工作室',
        url: 'https://example.com/python-game',
        tags: ['Python', '游戏开发', '项目实战'],
        visualScore: 75,
        auditoryScore: 40,
        readingScore: 60,
        kinestheticScore: 95,
        projects: [
          '贪吃蛇游戏',
          '俄罗斯方块',
          '飞机大战',
          '简单RPG游戏'
        ]
      }
    ],
    difficulty: 2,
    estimatedDuration: 240
  },
  // 数学路径
  {
    id: 'math1',
    title: '高等数学基础',
    description: '学习微积分和线性代数的基本概念',
    subject: '数学',
    coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1000',
    prerequisites: [],
    nextNodes: ['math2'],
    resources: [
      {
        id: 'math1_r1',
        title: '可视化微积分',
        description: '通过动态图形理解微积分概念',
        type: 'interactive',
        subject: '数学',
        coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1000',
        difficulty: 3,
        duration: 45,
        author: '数学教育研究所',
        url: 'https://example.com/calculus-visual',
        tags: ['微积分', '可视化学习', '数学建模'],
        visualScore: 95,
        auditoryScore: 60,
        readingScore: 50,
        kinestheticScore: 40,
        topics: [
          '函数与极限',
          '导数与微分',
          '积分与应用',
          '多元函数微积分'
        ]
      }
    ],
    difficulty: 3,
    estimatedDuration: 180
  },
  // 物理学路径
  {
    id: 'phys1',
    title: '经典力学入门',
    description: '学习牛顿力学和基本物理概念',
    subject: '物理',
    coverImage: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=1000',
    prerequisites: [],
    nextNodes: ['phys2'],
    resources: [
      {
        id: 'phys1_r1',
        title: '物理实验模拟',
        description: '通过交互式模拟实验学习物理概念',
        type: 'interactive',
        subject: '物理',
        coverImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1000',
        difficulty: 2,
        duration: 45,
        author: '物理教育实验室',
        url: 'https://example.com/physics-sim',
        tags: ['力学', '实验', '物理模拟'],
        visualScore: 90,
        auditoryScore: 50,
        readingScore: 60,
        kinestheticScore: 95,
        experiments: [
          '自由落体运动',
          '简谐运动',
          '碰撞实验',
          '力矩平衡'
        ]
      }
    ],
    difficulty: 2,
    estimatedDuration: 150
  },
  // 化学路径
  {
    id: 'chem1',
    title: '化学基础概念',
    description: '学习化学元素、分子结构和化学反应',
    subject: '化学',
    coverImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=1000',
    prerequisites: [],
    nextNodes: ['chem2'],
    resources: [
      {
        id: 'chem1_r1',
        title: '3D分子结构',
        description: '通过3D模型学习分子结构',
        type: 'video',
        subject: '化学',
        coverImage: 'https://images.unsplash.com/photo-1554475900-0a0350e3fc7b?q=80&w=1000',
        difficulty: 2,
        duration: 40,
        author: '化学教育研究所',
        url: 'https://example.com/molecule-3d',
        tags: ['分子结构', '3D可视化'],
        visualScore: 95,
        auditoryScore: 60,
        readingScore: 50,
        kinestheticScore: 70
      },
      {
        id: 'chem1_r2',
        title: '化学实验室',
        description: '虚拟化学实验室操作练习',
        type: 'exercise',
        subject: '化学',
        coverImage: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?q=80&w=1000',
        difficulty: 2,
        duration: 60,
        author: '虚拟实验室',
        url: 'https://example.com/chem-lab',
        tags: ['化学实验', '实践'],
        visualScore: 80,
        auditoryScore: 50,
        readingScore: 60,
        kinestheticScore: 90
      }
    ],
    difficulty: 2,
    estimatedDuration: 160
  }
];

export const useLearningStore = defineStore('learning', () => {
  const preferenceStore = usePreferenceStore();
  
  const knowledgeGraph = ref<KnowledgeNode[]>(mockKnowledgeGraph);
  const currentPath = ref<LearningPath | null>(null);
  const recommendations = ref<ResourceRecommendation[]>([]);

  // 计算资源与用户学习风格的匹配度
  function calculateResourceMatch(
    resource: LearningResource,
    learningStyle: Record<string, number>
  ): number {
    const weights = {
      visual: learningStyle.visual || 0,
      auditory: learningStyle.auditory || 0,
      reading: learningStyle.reading || 0,
      kinesthetic: learningStyle.kinesthetic || 0
    };

    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0) || 1;

    return (
      (weights.visual * resource.visualScore +
        weights.auditory * resource.auditoryScore +
        weights.reading * resource.readingScore +
        weights.kinesthetic * resource.kinestheticScore) /
      totalWeight
    );
  }

  // 生成学习路径推荐
  function generateLearningPath(subjects: string[]): LearningPath {
    const preference = preferenceStore.currentPreference;
    if (!preference) throw new Error('未设置学习偏好');

    // 筛选相关学科的知识节点
    const relevantNodes = knowledgeGraph.value.filter(node =>
      subjects.includes(node.subject)
    );

    // 根据学习风格为每个节点的资源计算匹配度
    const nodesWithScores = relevantNodes.map(node => ({
      ...node,
      resources: node.resources.map(resource => ({
        ...resource,
        matchScore: calculateResourceMatch(resource, preference.learningStyle)
      }))
    }));

    // 按照前置依赖关系排序节点
    const sortedNodes = sortNodesByPrerequisites(nodesWithScores);

    // 创建学习路径
    const path: LearningPath = {
      id: Date.now().toString(),
      userId: preference.userId,
      title: `个性化学习路径 - ${subjects.join(', ')}`,
      description: '基于您的学习偏好自动生成的学习路径',
      nodes: sortedNodes,
      totalDuration: sortedNodes.reduce((sum, node) => sum + node.estimatedDuration, 0),
      averageDifficulty: sortedNodes.reduce((sum, node) => sum + node.difficulty, 0) / sortedNodes.length,
      subjects,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
      matchScore: calculatePathMatchScore(sortedNodes, preference.learningStyle)
    };

    currentPath.value = path;
    return path;
  }

  // 根据前置依赖关系排序节点
  function sortNodesByPrerequisites(nodes: KnowledgeNode[]): KnowledgeNode[] {
    const sorted: KnowledgeNode[] = [];
    const visited = new Set<string>();

    function visit(node: KnowledgeNode) {
      if (visited.has(node.id)) return;
      
      // 先处理所有前置节点
      for (const preId of node.prerequisites) {
        const preNode = nodes.find(n => n.id === preId);
        if (preNode) visit(preNode);
      }

      visited.add(node.id);
      sorted.push(node);
    }

    nodes.forEach(node => visit(node));
    return sorted;
  }

  // 计算整个学习路径的匹配度
  function calculatePathMatchScore(
    nodes: KnowledgeNode[],
    learningStyle: Record<string, number>
  ): number {
    const resourceScores = nodes.flatMap(node =>
      node.resources.map(resource => calculateResourceMatch(resource, learningStyle))
    );

    return resourceScores.reduce((sum, score) => sum + score, 0) / resourceScores.length;
  }

  // 获取推荐的学习资源
  function getResourceRecommendations(node: KnowledgeNode): ResourceRecommendation[] {
    const preference = preferenceStore.currentPreference;
    if (!preference) return [];

    return node.resources
      .map(resource => {
        const matchScore = calculateResourceMatch(resource, preference.learningStyle);
        const reasons = [];

        // 根据学习风格匹配度添加推荐原因
        if (resource.visualScore >= 80 && preference.learningStyle.visual >= 70) {
          reasons.push('适合您的视觉学习风格');
        }
        if (resource.auditoryScore >= 80 && preference.learningStyle.auditory >= 70) {
          reasons.push('适合您的听觉学习风格');
        }
        if (resource.readingScore >= 80 && preference.learningStyle.reading >= 70) {
          reasons.push('适合您的阅读学习风格');
        }
        if (resource.kinestheticScore >= 80 && preference.learningStyle.kinesthetic >= 70) {
          reasons.push('适合您的动手实践风格');
        }

        // 根据资源类型添加推荐原因
        switch (resource.type) {
          case 'video':
            reasons.push('视频讲解生动直观');
            break;
          case 'interactive':
            reasons.push('提供沉浸式的互动学习体验');
            break;
          case 'exercise':
            reasons.push('包含丰富的练习题');
            break;
          case 'project':
            reasons.push('提供实战项目经验');
            break;
          case 'article':
            reasons.push('深入详细的文字讲解');
            break;
          case 'quiz':
            reasons.push('帮助检验学习成果');
            break;
          case 'ebook':
            reasons.push('系统完整的知识体系');
            break;
          case 'course':
            reasons.push('专业的课程设计');
            break;
        }

        // 根据难度添加推荐原因
        if (resource.difficulty <= 2) {
          reasons.push('适合入门学习');
        }

        // 添加作者信息
        if (resource.author) {
          reasons.push(`来自${resource.author}的精品内容`);
        }

        return {
          resource,
          matchScore,
          reasons
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  return {
    knowledgeGraph,
    currentPath,
    recommendations,
    generateLearningPath,
    getResourceRecommendations
  };
}); 