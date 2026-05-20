import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetTasksQuery } from '@/services/tasks/tasksApi';
import { OpenTasksPanel } from '@/components/domain';
import type { TaskFilter } from '@/shared/types';

const TASK_FILTER_PARAM = 'taskFilter';
const DEFAULT_FILTER: TaskFilter = 'All';

function isValidTaskFilter(v: string | null): v is TaskFilter {
  return v === 'All' || v === 'Mine' || v === 'Overdue';
}

export function OpenTasksPanelContainer() {
  const { data: tasks = [] } = useGetTasksQuery();
  const [params, setParams] = useSearchParams();

  const raw = params.get(TASK_FILTER_PARAM);
  const activeFilter: TaskFilter = isValidTaskFilter(raw) ? raw : DEFAULT_FILTER;

  const setActiveFilter = (next: TaskFilter) => {
    setParams((prev) => {
      const updated = new URLSearchParams(prev);
      if (next === DEFAULT_FILTER) {
        updated.delete(TASK_FILTER_PARAM);
      } else {
        updated.set(TASK_FILTER_PARAM, next);
      }
      return updated;
    }, { replace: true });
  };

  const filteredTasks = useMemo(() => {
    switch (activeFilter) {
      case 'Mine':    return tasks.filter((t) => t.isMine);
      case 'Overdue': return tasks.filter((t) => t.isOverdue);
      default:        return tasks;
    }
  }, [tasks, activeFilter]);

  const overdueCount = useMemo(() => tasks.filter((t) => t.isOverdue).length, [tasks]);

  return (
    <OpenTasksPanel
      tasks={filteredTasks}
      totalCount={tasks.length}
      overdueCount={overdueCount}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
    />
  );
}
