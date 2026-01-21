// src/components/TaskCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const TaskCard = ({ task, current_user_is_admin, onTaskDeleted }) => {
  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить эту задачу?')) return;

    try {
      await axios.delete(`/tasks/${task.id}/`);
      onTaskDeleted(task.id);
    } catch (err) {
      console.error('Ошибка удаления задачи:', err);
    }
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
        <span className={`badge ${
          task.status === 'completed' ? 'bg-success' :
          task.status === 'in_progress' ? 'bg-warning' : 'bg-secondary'
        }`}>
          {task.status || 'new'}
        </span>

        {current_user_is_admin && (
          <button
            className="btn btn-sm btn-outline-danger ms-2"
            onClick={handleDelete}
          >
            Удалить
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;