import type { SubmissionPriority } from './submission';

export type TaskPriority = SubmissionPriority;
export type TaskFilter = 'All' | 'Mine' | 'Overdue';

export interface Task {
  id: string;
  title: string;
  submissionId: string;
  dueDate: string;
  priority: TaskPriority;
  isOverdue: boolean;
  isMine: boolean;
}
