import { defineStore } from 'pinia'

interface UserProfile {
  id: string
  name: string
  age: number
  major: string
  grade: string
  learningStyle: string[]
  preferences: {
    subjects: string[]
    methods: string[]
    resources: string[]
  }
  progress: {
    [key: string]: number
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null as UserProfile | null,
    isAuthenticated: false
  }),
  
  actions: {
    setProfile(profile: UserProfile) {
      this.profile = profile
      this.isAuthenticated = true
    },
    
    updatePreferences(preferences: Partial<UserProfile['preferences']>) {
      if (this.profile) {
        this.profile.preferences = {
          ...this.profile.preferences,
          ...preferences
        }
      }
    },
    
    updateProgress(subject: string, progress: number) {
      if (this.profile) {
        this.profile.progress = {
          ...this.profile.progress,
          [subject]: progress
        }
      }
    },
    
    logout() {
      this.profile = null
      this.isAuthenticated = false
    }
  },
  
  getters: {
    userProfile: (state) => state.profile,
    isLoggedIn: (state) => state.isAuthenticated
  }
}) 