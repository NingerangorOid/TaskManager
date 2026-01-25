// src/components/TaskCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getStatusColor, getStatusLabel } from '../utils/statusColors';
import StatusDropdown from './StatusDropdown';

const TaskCard = ({ task, canManage, onTaskDeleted }) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const canChangeStatus = canManage || (task.assignee && task.assignee.id === task.author?.id);

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить эту задачу?')) return;

    try {
      await axios.delete(`/tasks/${task.id}/`, { withCredentials: true });
      onTaskDeleted(task.id);
    } catch (err) {
      console.error('Ошибка удаления задачи:', err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.patch(
        `/tasks/${task.id}/`,
        { status: newStatus },
        { withCredentials: true }
      );
      window.location.reload(); // ← обновляем страницу
    } catch (err) {
      console.error('Ошибка изменения статуса:', err);
    }
  };

  const toggleStatusMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowStatusMenu(!showStatusMenu);
  };

  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        <h5 className="card-title">
          <Link to={`/task/${task.id}`} className="text-decoration-none">
            {task.title}
          </Link>
        </h5>
        <p className="card-text">{task.description || 'Без описания'}</p>
        <div className="d-flex justify-content-between text-muted small">
          <span>Автор: {task.author?.username || '—'}</span>
          <span>Исполнитель: {task.assignee?.username || 'Не назначен'}</span>
        </div>

        {/* Кликабельная плашка статуса */}
        <span
          className={`badge ${getStatusColor(task.status)} me-2`}
          style={{
            cursor: 'pointer',
            padding: '0.5em 0.75em',
            fontSize: '0.8rem',
            fontWeight: 'bold',
          }}
          onClick={toggleStatusMenu}
        >
          {getStatusLabel(task.status)}
        </span>

        {/* Кнопка удаления — только для staff и админов */}
        {canManage && (
          <button
            className="btn btn-sm btn-outline-danger ms-2"
            onClick={handleDelete}
          >
            Удалить
          </button>
        )}

        {/* Выпадающее меню */}
        {showStatusMenu && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 1000,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <StatusDropdown
              currentStatus={task.status}
              onChange={handleStatusChange}
              onClose={() => setShowStatusMenu(false)}
              canManage={canChangeStatus} // ← передаём права
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;