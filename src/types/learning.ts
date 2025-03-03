export type ResourceType = 
  | 'video'
  | 'article'
  | 'quiz'
  | 'exercise'
  | 'project'
  | 'interactive'
  | 'ebook'
  | 'course';

export interface LearningResource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  subject: string;
  difficulty: number; // 1-5
  duration: number; // 分钟
  url: string;
  tags: string[];
  coverImage: string;
  author?: string;
  visualScore: number; // 视觉学习适配度 0-100
  auditoryScore: number; // 听觉学习适配度 0-100
  readingScore: number; // 阅读学习适配度 0-100
  kinestheticScore: number; // 动手学习适配度 0-100
  chapters?: string[];
  exercises?: string[];
  projects?: string[];
  experiments?: string[];
  topics?: string[];
  relatedResources?: string[];
}

export interface KnowledgeNode {
  id: string;
  title: string;
  description: string;
  subject: string;
  coverImage: string;
  prerequisites: string[]; // 前置节点ID
  nextNodes: string[]; // 后续节点ID
  resources: LearningResource[];
  difficulty: number; // 1-5
  estimatedDuration: number; // 分钟
}

export interface LearningPath {
  id: string;
  userId: string;
  title: string;
  description: string;
  nodes: KnowledgeNode[];
  totalDuration: number;
  averageDifficulty: number;
  subjects: string[];
  createdAt: string;
  updatedAt: string;
  progress: number; // 0-100
  matchScore: number; // 与用户偏好的匹配度 0-100
}

export interface ResourceRecommendation {
  resource: LearningResource;
  matchScore: number;
  reasons: string[];
} 