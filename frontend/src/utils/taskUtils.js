// Format date to YYYY-MM-DD
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Format date to readable format (e.g., May 5, 2023)
export const formatReadableDate = (date) => {
  if (!date) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

// Check if a task is overdue
export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDueDate = new Date(dueDate);
  taskDueDate.setHours(0, 0, 0, 0);
  return taskDueDate < today;
};

// Get task status including overdue
export const getTaskStatus = (task) => {
  if (task.completed) return 'COMPLETED';
  if (isOverdue(task.dueDate)) return 'OVERDUE';
  return task.status || 'TODO';
};

// Priority levels
export const PRIORITY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High'
};

// Task status options
export const TASK_STATUS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  OVERDUE: 'Overdue'
};

// Get color based on priority
export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'HIGH':
      return 'danger';
    case 'MEDIUM':
      return 'warning';
    case 'LOW':
      return 'info';
    default:
      return 'secondary';
  }
};

// Get color based on status
export const getStatusColor = (status) => {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'IN_PROGRESS':
      return 'primary';
    case 'OVERDUE':
      return 'danger';
    case 'TODO':
      return 'secondary';
    default:
      return 'secondary';
  }
};

// Calculate completion percentage for a task with subtasks
export const calculateCompletionPercentage = (task) => {
  if (!task.subtasks || task.subtasks.length === 0) {
    return task.completed ? 100 : 0;
  }
  
  const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
  return Math.round((completedSubtasks / task.subtasks.length) * 100);
};

// Sort tasks by various criteria
export const sortTasks = (tasks, sortBy = 'dueDate', sortOrder = 'asc') => {
  return [...tasks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'dueDate':
        comparison = new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31');
        break;
      case 'priority':
        const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'status':
        comparison = getTaskStatus(a).localeCompare(getTaskStatus(b));
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
};
