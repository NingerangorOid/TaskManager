// src/components/TaskList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TaskList = ({ filterAssigneeId = null }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const navigate = useNavigate();

  const fetchTasks = async (url = '/tasks/') => {
    setLoading(true);
    try {
      let fullUrl = url;
      if (filterAssigneeId) {
        const separator = fullUrl.includes('?') ? '&' : '?';
        fullUrl += `${separator}assignee=${filterAssigneeId}`;
      }

      const res = await axios.get(fullUrl, { withCredentials: true });
      setTasks(res.data.results || []);
      setNextPage(res.data.next);
      setPrevPage(res.data.previous);
    } catch (err) {
      console.error('Ошибка загрузки задач:', err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filterAssigneeId]);

  const handleNext = () => nextPage && fetchTasks(nextPage);
  const handlePrev = () => prevPage && fetchTasks(prevPage);

  if (loading) return <p>Загрузка задач...</p>;

  return (
    <div>
      {tasks.length > 0 ? (
        <ul className="list-group">
          {tasks.map(task => (
            <li key={task.id} className="list-group-item">
              <h5>{task.title}</h5>
              <p>{task.description}</p>
              <div className="d-flex justify-content-between align-items-center">
                <span className={`badge bg-${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
                <small>Исполнитель: {task.assignee?.username || '—'}</small>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => navigate(`/task/${task.id}`)}
                >
                  Комментарии
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>Нет задач</p>
      )}

      <div className="mt-3">
        <button
          className="btn btn-secondary me-2"
          onClick={handlePrev}
          disabled={!prevPage}
        >
          Предыдущая
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleNext}
          disabled={!nextPage}
        >
          Следующая
        </button>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'new': return 'secondary';
    case 'in_progress': return 'warning';
    case 'done': return 'success';
    default: return 'light';
  }
};

export default TaskList;