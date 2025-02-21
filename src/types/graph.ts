import type { Selection, BaseType } from 'd3-selection'
import type { SimulationNodeDatum } from 'd3-force'

export type ViewType = 'core' | 'track' | 'resource' | 'preference' | 'project' | 'concept' | 'skill'
export type ResourceType = 'video' | 'document' | 'project' | 'quiz'
export type CategoryType = 'core' | 'track' | 'resource' | 'preference' | 'project' | 'concept' | 'skill'

export interface GraphNode extends SimulationNodeDatum {
  id: string
  name: string
  category: CategoryType
  difficulty?: number
  description?: string
  prerequisites?: string[]
  matchedStyles?: string[]
  resources?: NodeResource[]
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

export interface GraphLink {
  source: string
  target: string
  value: number
  type?: string
}

export interface NodeResource {
  id: string
  title: string
  type: ResourceType
  difficulty: number
  duration: string
  description: string
  url?: string
  learningStyle?: string[]
}

export interface DialogState {
  showProgressDialog: boolean
  showPreferenceDialog: boolean
  showLoginDialog: boolean
}

export type D3Selection = Selection<BaseType, unknown, null, undefined>
export type D3DragEvent = any
export type D3ZoomEvent = any
export type D3ZoomBehavior = any
export type D3Transition = any

export interface LegendItem {
  category: CategoryType
  label: string
} 