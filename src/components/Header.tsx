import { TaskFilters } from '../types';

const statuses: TaskFilters['status'][] = ['all', 'todo', 'in_progress', 'done'];
const priorities: TaskFilters['priority'][] = ['all', 'low', 'medium', 'high'];

type HeaderProps = {
  filters: TaskFilters;
  onFiltersChange: (next: TaskFilters) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
};

export const Header = ({ filters, onFiltersChange, theme, onToggleTheme }: HeaderProps) => {
  return (
    <header className="header">
      <div>
        <p className="eyebrow">Task Manager</p>
        <h1>Организуйте задачи в одном месте</h1>
      </div>

      <div className="controls">
        <label className="control">
          <span>Поиск</span>
          <input
            value={filters.query}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                query: event.target.value,
              })
            }
            placeholder="Название, описание, тег"
          />
        </label>

        <label className="control">
          <span>Статус</span>
          <select
            value={filters.status}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                status: event.target.value as TaskFilters['status'],
              })
            }
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? 'Все' : status.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>

        <label className="control">
          <span>Приоритет</span>
          <select
            value={filters.priority}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                priority: event.target.value as TaskFilters['priority'],
              })
            }
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority === 'all' ? 'Все' : priority}
              </option>
            ))}
          </select>
        </label>

        <label className="control">
          <span>Тег</span>
          <input
            value={filters.tag}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                tag: event.target.value,
              })
            }
            placeholder="например, дизайн"
          />
        </label>

        <label className="toggle">
          <input
            type="checkbox"
            checked={filters.showOverdueOnly}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                showOverdueOnly: event.target.checked,
              })
            }
          />
          <span>Только просроченные</span>
        </label>

        <button className="theme-toggle" type="button" onClick={onToggleTheme}>
          {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
        </button>
      </div>
    </header>
  );
};
