import { Task, TaskFilters } from './types';

const STORAGE_KEY = 'task-manager-v1';

export const defaultFilters: TaskFilters = {
  query: '',
  status: 'all',
  priority: 'all',
  tag: '',
  showOverdueOnly: false,
};

export const loadTasks = (): Task[] => {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Task[];
    return parsed ?? [];
  } catch {
    return [];
  }
};

export const saveTasks = (tasks: Task[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const normalizeTags = (value: string) =>
  value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

export const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString();
};

export const isOverdue = (deadline?: string) => {
  if (!deadline) return false;
  const deadlineDate = new Date(deadline);
  if (Number.isNaN(deadlineDate.getTime())) return false;
  return deadlineDate.getTime() < Date.now();
};

export const applyFilters = (tasks: Task[], filters: TaskFilters) => {
  const query = filters.query.toLowerCase();
  return tasks.filter((task) => {
    const matchesQuery =
      !query ||
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.tags.some((tag) => tag.toLowerCase().includes(query));
    const matchesStatus = filters.status === 'all' || task.status === filters.status;
    const matchesPriority =
      filters.priority === 'all' || task.priority === filters.priority;
    const matchesTag =
      !filters.tag || task.tags.some((tag) => tag.toLowerCase().includes(filters.tag.toLowerCase()));
    const matchesOverdue = !filters.showOverdueOnly || isOverdue(task.deadline);

    return matchesQuery && matchesStatus && matchesPriority && matchesTag && matchesOverdue;
  });
};
