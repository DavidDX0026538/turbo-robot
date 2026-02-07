import { useMemo, useState } from 'react';
import { Task, TaskFilters, TaskStatus } from '../types';
import { applyFilters, createId, defaultFilters, loadTasks, saveTasks } from '../utils';

type TaskDraft = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

const sortByUpdated = (tasks: Task[]) =>
  [...tasks].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const filteredTasks = useMemo(() => applyFilters(tasks, filters), [tasks, filters]);
  const taskByStatus = useMemo(() => {
    const bucket: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
    filteredTasks.forEach((task) => bucket[task.status].push(task));
    Object.keys(bucket).forEach((key) => {
      bucket[key as TaskStatus] = sortByUpdated(bucket[key as TaskStatus]);
    });
    return bucket;
  }, [filteredTasks]);

  const persist = (nextTasks: Task[]) => {
    setTasks(nextTasks);
    saveTasks(nextTasks);
  };

  const createTask = (draft: TaskDraft) => {
    const now = new Date().toISOString();
    const nextTask: Task = {
      id: createId(),
      createdAt: now,
      updatedAt: now,
      ...draft,
    };
    persist([nextTask, ...tasks]);
  };

  const updateTask = (id: string, draft: TaskDraft) => {
    const now = new Date().toISOString();
    const nextTasks = tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            ...draft,
            updatedAt: now,
          }
        : task,
    );
    persist(nextTasks);
  };

  const deleteTask = (id: string) => {
    persist(tasks.filter((task) => task.id !== id));
  };

  const moveTask = (id: string, status: TaskStatus) => {
    const now = new Date().toISOString();
    const nextTasks = tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            status,
            updatedAt: now,
          }
        : task,
    );
    persist(nextTasks);
  };

  return {
    tasks,
    filters,
    filteredTasks,
    taskByStatus,
    editingTaskId,
    setEditingTaskId,
    setFilters,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  };
};
