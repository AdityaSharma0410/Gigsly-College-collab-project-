import { Task } from '@/types/task'
import { MapPin, Clock, User, DollarSign, Star, Users, ArrowRight, Eye, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'

interface TaskCardProps {
  task: Task
  onView?: (task: Task) => void
  onApply?: (task: Task) => void
}

export default function TaskCard({ task, onView, onApply }: TaskCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [posterReviews, setPosterReviews] = useState<{ avg: number, count: number } | null>(null);

  useEffect(() => {
    let ignore = false;
    async function fetchReviews() {
      if (task.postedBy) {
        try {
          const res = await fetch(`/api/reviews?userId=${encodeURIComponent(task.postedBy)}`);
          if (res.ok) {
            const data = await res.json();
            if (!ignore) {
              const avg = data.length ? data.reduce((sum, r) => sum + r.rating, 0) / data.length : 0;
              setPosterReviews({ avg, count: data.length });
            }
          } else {
            if (!ignore) setPosterReviews(null);
          }
        } catch {
          if (!ignore) setPosterReviews(null);
        }
      }
    }
    fetchReviews();
    return () => { ignore = true; };
  }, [task.postedBy]);

  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(d);
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'Technology': 'from-blue-500 to-cyan-500',
      'Business': 'from-green-500 to-emerald-500',
      'Legal': 'from-purple-500 to-violet-500',
      'Content Writing': 'from-pink-500 to-rose-500',
      'Design': 'from-orange-500 to-red-500',
      'Marketing': 'from-indigo-500 to-purple-500',
      'Education': 'from-teal-500 to-cyan-500',
      'Consulting': 'from-yellow-500 to-orange-500',
      'Finance': 'from-emerald-500 to-green-500',
      'Healthcare': 'from-red-500 to-pink-500'
    }
    return colors[category as keyof typeof colors] || 'from-gray-500 to-gray-600'
  }

  return (
    <div 
      className="card-enhanced group relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with enhanced animations */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gradient transition-all duration-200">
            {task.title}
          </h3>
          <p className="text-white/70 text-sm leading-relaxed line-clamp-3 group-hover:text-white/80 transition-colors duration-200">
            {task.description}
          </p>
        </div>
        {/* Like button */}
        <button 
          onClick={() => setIsLiked(!isLiked)}
          className={`p-2 rounded-full transition-all duration-200 hover:scale-105 ${isLiked ? 'text-red-400' : 'text-white/40 hover:text-red-400'}`}
        >
          <Heart className={`w-5 h-5 transition-all duration-200 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Enhanced Budget section */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center text-green-400 font-bold text-lg group-hover:scale-105 transition-transform duration-200">
          <span className="mr-2 text-2xl" role="img" aria-label="cash">💸</span>
          <span className="text-gradient-animated">₹{task.budget.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex items-center text-white/60 text-sm group-hover:text-white/80 transition-colors duration-200">
          <Users className="w-4 h-4 mr-1" />
          <span>{task.applications} proposals</span>
        </div>
      </div>

      {/* Enhanced Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
        <div className="flex items-center text-white/60 text-sm group-hover:text-white/80 transition-colors duration-200">
          <MapPin className="w-4 h-4 mr-2 text-blue-400" />
          <span>{task.location}</span>
        </div>
        <div className="flex items-center text-white/60 text-sm group-hover:text-white/80 transition-colors duration-200">
          <Clock className="w-4 h-4 mr-2 text-purple-400" />
          <span>{formatDate(task.postedAt)}</span>
        </div>
      </div>

      {/* Enhanced Posted By section */}
      <div className="flex items-center mb-6 relative z-10">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-3 group-hover:scale-105 transition-transform duration-200 shadow-glow">
          <span className="text-white font-semibold text-sm">
            {task?.postedBy && typeof task.postedBy === 'object' && task.postedBy.name
              ? (task.postedBy.name.charAt(0).toUpperCase())
              : (typeof task?.postedBy === 'string' && task.postedBy.length > 0
                ? task.postedBy.charAt(0).toUpperCase()
                : '?')}
          </span>
        </div>
        <div>
          <p className="text-white font-medium text-sm group-hover:text-gradient transition-all duration-200">
            {task?.postedBy && typeof task.postedBy === 'object' && task.postedBy.name
              ? task.postedBy.name
              : (typeof task?.postedBy === 'string' ? task.postedBy : 'Unknown')}
          </p>
          <div className="flex items-center text-yellow-400 text-xs">
            {posterReviews ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <span key={i}>{i < Math.round(posterReviews.avg) ? '★' : '☆'}</span>
                ))}
                <span className="ml-1 text-white/60">({posterReviews.count} review{posterReviews.count !== 1 ? 's' : ''})</span>
              </>
            ) : (
              <span>Loading...</span>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Category and Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-white/10 relative z-10">
        <span className={`bg-gradient-to-r ${getCategoryColor(task.category)} text-white text-xs font-medium px-3 py-1 rounded-full group-hover:scale-105 transition-transform duration-200 shadow-glow`}>
          {task.category}
        </span>
        
        <div className="flex space-x-2">
          <button
            className="btn-secondary text-sm px-4 py-2 group/btn flex items-center space-x-1 hover:bg-white/15 transition-all duration-200"
            onClick={() => onView && onView(task)}
          >
            <Eye className="w-4 h-4 group-hover/btn:scale-105 transition-transform duration-200" />
            <span>View</span>
          </button>
          <button
            className="btn-primary text-sm px-4 py-2 flex items-center space-x-1 group/btn hover:scale-105 transition-all duration-200"
            onClick={() => onApply && onApply(task)}
          >
            <span>Apply</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>


    </div>
  )
} 