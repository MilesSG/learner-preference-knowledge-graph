export interface LearningStyle {
  visual: number;
  auditory: number;
  reading: number;
  kinesthetic: number;
}

export interface LearningPreference {
  id: string;
  userId: string;
  subjectPreferences: Record<string, number>;
  timePreference: {
    preferredTime: string[];
    studyDuration: number;
  };
  learningStyle: LearningStyle;
  difficultyPreference: number;
  interactivityPreference: number;
  socialLearning: boolean;
  answers: Record<string, number | string[] | boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface PreferenceQuestion {
  id: string;
  category: 'learningStyle' | 'subjectPreference' | 'timePreference' | 'general';
  question: string;
  type: 'slider' | 'multiSelect' | 'singleSelect' | 'boolean';
  options?: string[];
  min?: number;
  max?: number;
} 