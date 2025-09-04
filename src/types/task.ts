export interface Task {
  id: string
  title: string
  description: string
  budget: number
  category: string
  location: string
  postedBy: string
  postedAt: Date
  status: 'open' | 'in-progress' | 'completed'
  applications: number
}

export interface TaskFormData {
  title: string
  description: string
  budget: number
  category: string
  location: string
  postedBy: string
} 