import { Task } from '../types';
import { formatDate, isOverdue } from '../utils';

type TaskItemProps = {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
};

export const TaskItem = ({ task, onEdit, onDelete }: TaskItemProps) => {
  const overdue = isOverdue(task.deadline);

  return (
    <article
      className={`task-card priority-${task.priority} ${overdue ? 'overdue' : ''}`}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', task.id);
        event.dataTransfer.effectAllowed = 'move';
      }}
    >
      <header>
        <div>
          <h3>{task.title}</h3>
          {task.description && <p>{task.description}</p>}
        </div>
        <span className={`badge status-${task.status}`}>{task.status.replace('_', ' ')}</span>
      </header>

      <div className="meta">
        {task.deadline && (
          <span className={overdue ? 'danger' : ''}>
            Дедлайн: {formatDate(task.deadline)}
          </span>
        )}
        <span>Приоритет: {task.priority}</span>
      </div>

      <div className="tags">
        {task.tags.map((tag) => (
          <span key={tag} className="tag">
            #{tag}
          </span>
        ))}
      </div>

      <div className="actions">
        <button type="button" onClick={() => onEdit(task)}>
          Редактировать
        </button>
        <button type="button" className="ghost" onClick={() => onDelete(task.id)}>
          Удалить
        </button>
      </div>
    </article>
  );
};
