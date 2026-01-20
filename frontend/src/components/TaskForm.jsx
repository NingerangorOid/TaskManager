// src/components/TaskForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Загружаем список пользователей для выбора исполнителя
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/users/');
        setUsers(res.data);
      } catch (err) {
        console.error('Ошибка загрузки пользователей:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/tasks/', {
        title,
        description,
        assignee: assigneeId || null, // если не выбран — null
        status: 'new', // или другой статус по умолчанию
      });
      // Сброс формы
      setTitle('');
      setDescription('');
      setAssigneeId('');
      // Перезагрузим список задач (или можно сделать через refetch)
      window.location.reload(); // временно; позже заменим на обновление состояния
    } catch (err) {
      setError('Не удалось создать задачу');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label className="form-label">Заголовок</label>
        <input
          type="text"
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Описание</label>
        <textarea
          className="form-control"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Исполнитель</label>
        <select
          className="form-select"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
        >
          <option value="">Не назначен</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Создание...' : 'Создать задачу'}
      </button>
    </form>
  );
};

export default TaskForm;