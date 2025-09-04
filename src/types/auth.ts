export interface User {
  id: string
  phone: string
  name: string
  email?: string
  avatar?: string
  rating: number
  completedTasks: number
  totalEarnings: number
  joinedAt: Date
  password?: string // Add password for demo
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginFormData {
  phone: string
  otp: string
}

export interface SignupFormData {
  phone: string
  name: string
  email?: string
} 