import { Task, TaskStatus } from '../types';
import { TaskItem } from './TaskItem';

const columns: { key: TaskStatus; title: string; description: string }[] = [
  { key: 'todo', title: 'To do', description: 'Запланировать и приоритизировать' },
  { key: 'in_progress', title: 'In progress', description: 'Фокус на выполнении' },
  { key: 'done', title: 'Done', description: 'Задачи закрыты' },
];

type TaskListProps = {
  tasksByStatus: Record<TaskStatus, Task[]>;
  onMove: (id: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
};

export const TaskList = ({ tasksByStatus, onMove, onEdit, onDelete }: TaskListProps) => {
  return (
    <section className="board">
      {columns.map((column) => (
        <div
          key={column.key}
          className="column"
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
          }}
          onDrop={(event) => {
            event.preventDefault();
            const taskId = event.dataTransfer.getData('text/plain');
            if (taskId) {
              onMove(taskId, column.key);
            }
          }}
        >
          <header>
            <h2>{column.title}</h2>
            <p>{column.description}</p>
            <span className="count">{tasksByStatus[column.key].length}</span>
          </header>

          <div className="cards">
            {tasksByStatus[column.key].map((task) => (
              <TaskItem key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
            ))}
            {tasksByStatus[column.key].length === 0 && (
              <div className="empty">Нет задач</div>
            )}
          </div>
        </div>
      ))}
    </section>
  );
};
