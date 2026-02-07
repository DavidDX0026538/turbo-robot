import { useMemo, useState } from 'react';
import { Header } from './components/Header';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { useTasks } from './hooks/useTasks';
import { Task } from './types';

export const App = () => {
  const {
    filters,
    setFilters,
    taskByStatus,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    editingTaskId,
    setEditingTaskId,
    tasks,
  } = useTasks();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === editingTaskId) ?? null,
    [tasks, editingTaskId],
  );

  const handleSubmit = (draft: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedTask) {
      updateTask(selectedTask.id, draft);
    } else {
      createTask(draft);
    }
    setEditingTaskId(null);
  };

  return (
    <div className={`app ${theme}`}>
      <Header
        filters={filters}
        onFiltersChange={setFilters}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
      />

      <main>
        <section className="layout">
          <TaskForm selectedTask={selectedTask} onSubmit={handleSubmit} onCancel={() => setEditingTaskId(null)} />

          <TaskList
            tasksByStatus={taskByStatus}
            onMove={moveTask}
            onEdit={(task) => setEditingTaskId(task.id)}
            onDelete={deleteTask}
          />
        </section>
      </main>
    </div>
  );
};
