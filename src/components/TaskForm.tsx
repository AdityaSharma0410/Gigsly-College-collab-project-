'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { TaskFormData } from '@/types/task'

interface TaskFormProps {
  onSubmit: (task: TaskFormData) => void
  onClose: () => void
  defaultLocation?: string
}

const categories = [
  'Technology',
  'Business',
  'Legal',
  'Content Writing',
  'Design',
  'Marketing',
  'Education',
  'Consulting',
  'Finance',
  'Healthcare',
  'Teaching',
  'Household Chores',
  'Home Repair',
  'Event Planning',
  'Photography',
  'Videography',
  'Fitness & Wellness',
  'Beauty & Personal Care',
  'Pet Care',
  'Gardening',
  'Transportation',
  'Delivery',
  'Tutoring',
  'Translation',
  'Writing & Editing',
  'Accounting',
  'Data Entry',
  'Virtual Assistance',
  'Cleaning',
  'Cooking & Catering',
  'Childcare',
  'Elderly Care',
  'Moving Services',
  'Car Wash & Detailing',
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting',
  'Appliance Repair',
  'IT Support',
  'Web Development',
  'App Development',
  'Graphic Design',
  'Social Media Management',
  'SEO',
  'HR & Recruitment',
  'Real Estate',
  'Travel Planning',
  'Other'
]

export default function TaskForm({ onSubmit, onClose, defaultLocation }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    budget: 0,
    category: '',
    location: defaultLocation || '',
    postedBy: ''
  })
  const [taskFormError, setTaskFormError] = useState('');
  const [taskFormSuccess, setTaskFormSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setTaskFormError('Service title is required');
      return;
    }
    if (!formData.description.trim()) {
      setTaskFormError('Service description is required');
      return;
    }
    if (!formData.category.trim()) {
      setTaskFormError('Category is required');
      return;
    }
    if (!formData.location.trim()) {
      setTaskFormError('Location is required');
      return;
    }
    if (!formData.postedBy.trim()) {
      setTaskFormError('Company/Client name is required');
      return;
    }
    if (!formData.budget || formData.budget < 30) {
      setTaskFormError('Budget must be at least ₹30');
      return;
    }
    setTaskFormError('');
    onSubmit(formData);
    setTaskFormSuccess('Task posted successfully!');
  }

  const handleChange = (field: keyof TaskFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gradient mb-2">
                Post Professional Service
              </h2>
              <p className="text-white/60">
                Connect with top professionals for your project
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors p-2 hover-glow rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Error/Success Feedback for Task Posting */}
          {taskFormError && (
            <div className="mb-4 px-4 py-2 rounded text-sm font-medium bg-red-500/20 text-red-300" aria-live="polite">{taskFormError}</div>
          )}
          {taskFormSuccess && (
            <div className="mb-4 px-4 py-2 rounded text-sm font-medium bg-green-500/20 text-green-300" aria-live="polite">{taskFormSuccess}</div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6" role="form" aria-label="Task submission form">
            {/* Service Title */}
            <div className="relative">
              <label htmlFor="title" className="block text-sm font-medium text-white/80 mb-2">
                Service Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="input-field"
                required
                aria-label="Enter service title"
              />
            </div>

            {/* Description */}
            <div className="relative">
              <label htmlFor="description" className="block text-sm font-medium text-white/80 mb-2">
                Service Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className="input-field"
                required
                aria-label="Enter service description"
              />
            </div>

            {/* Budget */}
            <div className="relative">
              <label htmlFor="budget" className="block text-sm font-medium text-white/80 mb-2">
                Budget (₹) *
              </label>
              <input
                type="number"
                id="budget"
                value={formData.budget}
                onChange={(e) => handleChange('budget', parseInt(e.target.value) || 0)}
                min={30}
                className="input-field"
                required
                aria-label="Enter budget"
              />
            </div>

            {/* Category */}
            <div className="relative">
              <label htmlFor="category" className="block text-sm font-medium text-white/80 mb-2">
                Category *
              </label>
              <div className="relative">
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="input-field appearance-none bg-black/40 border border-white/20 text-white rounded-xl shadow-inner px-4 py-3 focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400/60 transition-all duration-200 backdrop-blur-md placeholder-white/50 hover:bg-black/60"
                  required
                  aria-label="Select category"
                >
                  <option value="" className="bg-black/80 text-white/70">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="bg-black/90 text-white/90">
                      {category}
                    </option>
                  ))}
                </select>
                {/* Chevron Icon */}
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="relative">
              <label htmlFor="location" className="block text-sm font-medium text-white/80 mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="input-field"
                required
                aria-label="Enter location"
              />
            </div>

            {/* Company/Client Name */}
            <div className="relative">
              <label htmlFor="postedBy" className="block text-sm font-medium text-white/80 mb-2">
                Company/Client Name *
              </label>
              <input
                type="text"
                id="postedBy"
                value={formData.postedBy}
                onChange={(e) => handleChange('postedBy', e.target.value)}
                className="input-field"
                required
                aria-label="Enter company/client name"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                className="btn-primary flex-1"
                aria-label="Submit task"
              >
                Post Service
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
                aria-label="Cancel task"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Tips */}
          <div className="mt-8 p-4 glass rounded-xl">
            <h4 className="text-white font-medium mb-2">💡 Tips for better responses:</h4>
            <ul className="text-white/60 text-sm space-y-1">
              <li>• Be specific about your requirements</li>
              <li>• Include timeline and budget expectations</li>
              <li>• Mention required skills and experience</li>
              <li>• Provide clear project deliverables</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 