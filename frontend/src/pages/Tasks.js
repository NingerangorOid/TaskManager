// src/pages/Tasks.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Tasks = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState(''); // строка: ID пользователя или пусто
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/users/', { withCredentials: true });

      let usersData;
      if (Array.isArray(response.data)) {
        usersData = response.data;
      } else {
        usersData = response.data.results || [];
      }

      setUsers(usersData);
    } catch (err) {
      console.error('Ошибка при загрузке пользователей:', err);
      setError('Не удалось загрузить список пользователей');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Преобразуем строку в число или null
      const assigneeId = assignee ? Number(assignee) : null;

      const response = await axios.post(
        '/tasks/',
        {
          title,
          description,
          assignee_id: assigneeId, // ← именно assignee_id!
        },
        { withCredentials: true }
      );

      navigate(`/task/${response.data.id}`);
    } catch (err) {
      console.error('Ошибка создания задачи:', err);
      setError('Не удалось создать задачу. Проверьте данные.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Создать новую задачу</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Заголовок</label>
          <input
            id="title"
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Описание</label>
          <textarea
            id="description"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="5"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="assignee" className="form-label">Исполнитель</label>
          <select
            id="assignee"
            className="form-select"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          >
            <option value="">Не назначен</option>
            {Array.isArray(users) && users.map(user => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          Создать задачу
        </button>
      </form>
    </div>
  );
};

export default Tasks;