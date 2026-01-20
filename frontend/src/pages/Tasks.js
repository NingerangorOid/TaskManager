// src/pages/Tasks.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Tasks = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/users/', { withCredentials: true });
      setUsers(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке пользователей');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/tasks/', {
        title,
        description,
        assignee: assignee || null,
      }, {
        withCredentials: true,
      });
      navigate(`/task/${response.data.id}`);
    } catch (err) {
      setError('Не удалось создать задачу');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Создать новую задачу</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Заголовок</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Описание</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="5"
          />
        </div>
        <div className="mb-3">
          <label>Исполнитель</label>
          <select
            className="form-select"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          >
            <option value="">Не назначен</option>
            {users.map(user => (
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