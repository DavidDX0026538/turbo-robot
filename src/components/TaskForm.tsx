import { useMemo, useState } from 'react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { normalizeTags } from '../utils';

type TaskFormProps = {
  selectedTask?: Task | null;
  onSubmit: (draft: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
};

const priorities: TaskPriority[] = ['low', 'medium', 'high'];
const statuses: TaskStatus[] = ['todo', 'in_progress', 'done'];

export const TaskForm = ({ selectedTask, onSubmit, onCancel }: TaskFormProps) => {
  const [title, setTitle] = useState(selectedTask?.title ?? '');
  const [description, setDescription] = useState(selectedTask?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(selectedTask?.status ?? 'todo');
  const [priority, setPriority] = useState<TaskPriority>(
    selectedTask?.priority ?? 'medium',
  );
  const [deadline, setDeadline] = useState(selectedTask?.deadline ?? '');
  const [tags, setTags] = useState(selectedTask?.tags.join(', ') ?? '');

  const isEditing = Boolean(selectedTask);

  const canSubmit = useMemo(() => title.trim().length > 0, [title]);

  return (
    <form
      className="task-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        onSubmit({
          title: title.trim(),
          description: description.trim() || undefined,
          status,
          priority,
          deadline: deadline || undefined,
          tags: normalizeTags(tags),
        });
      }}
    >
      <div className="form-header">
        <div>
          <p className="eyebrow">{isEditing ? 'Редактирование' : 'Новая задача'}</p>
          <h2>{isEditing ? 'Обновите задачу' : 'Добавьте задачу'}</h2>
        </div>
        <button type="button" className="ghost" onClick={onCancel}>
          Сбросить
        </button>
      </div>

      <label>
        Название*
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Например, подготовить презентацию"
        />
      </label>

      <label>
        Описание
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Коротко опишите задачу"
          rows={3}
        />
      </label>

      <div className="grid">
        <label>
          Статус
          <select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)}>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>
        <label>
          Приоритет
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as TaskPriority)}
          >
            {priorities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Дедлайн
          <input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
        </label>
        <label>
          Теги
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="маркетинг, дизайн"
          />
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={!canSubmit}>
          {isEditing ? 'Сохранить' : 'Создать'}
        </button>
        <button type="button" className="ghost" onClick={onCancel}>
          Очистить форму
        </button>
      </div>
    </form>
  );
};
