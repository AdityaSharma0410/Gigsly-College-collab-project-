import { Task } from '@/types/task'
import TaskCard from './TaskCard'

interface TaskFeedProps {
  tasks: Task[]
  onViewTask?: (task: Task) => void
  onApplyTask?: (task: Task) => void
}

export default function TaskFeed({ tasks, onViewTask, onApplyTask }: TaskFeedProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {tasks.map((task, index) => (
        <div 
          key={task.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <TaskCard task={task} onView={onViewTask} onApply={onApplyTask} />
        </div>
      ))}
    </div>
  )
} 